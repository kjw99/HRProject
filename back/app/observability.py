import os
import threading
import time
from collections import defaultdict
from typing import DefaultDict

from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import PlainTextResponse


BUCKETS = (0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0)


class MetricsStore:
    def __init__(self, branch: str) -> None:
        self.branch = branch
        self.started_at = time.time()
        self._lock = threading.Lock()
        self._requests: DefaultDict[tuple[str, str, str], int] = defaultdict(int)
        self._duration_sum: DefaultDict[tuple[str, str, str], float] = defaultdict(float)
        self._duration_count: DefaultDict[tuple[str, str, str], int] = defaultdict(int)
        self._duration_buckets: DefaultDict[tuple[str, str, str, float], int] = defaultdict(int)
        self._in_progress = 0

    def start_request(self) -> None:
        with self._lock:
            self._in_progress += 1

    def finish_request(self, method: str, path: str, status_code: int, duration: float) -> None:
        status = str(status_code)
        key = (method, path, status)
        with self._lock:
            self._in_progress = max(0, self._in_progress - 1)
            self._requests[key] += 1
            self._duration_sum[key] += duration
            self._duration_count[key] += 1
            for bucket in BUCKETS:
                if duration <= bucket:
                    self._duration_buckets[(method, path, status, bucket)] += 1

    def render(self) -> str:
        with self._lock:
            requests = dict(self._requests)
            duration_sum = dict(self._duration_sum)
            duration_count = dict(self._duration_count)
            duration_buckets = dict(self._duration_buckets)
            in_progress = self._in_progress

        lines = [
            "# HELP hrproject_app_info Application metadata.",
            "# TYPE hrproject_app_info gauge",
            f'hrproject_app_info{{branch="{self.branch}"}} 1',
            "# HELP hrproject_uptime_seconds Application uptime in seconds.",
            "# TYPE hrproject_uptime_seconds gauge",
            f'hrproject_uptime_seconds{{branch="{self.branch}"}} {time.time() - self.started_at:.6f}',
            "# HELP hrproject_http_in_progress_requests In-progress HTTP requests.",
            "# TYPE hrproject_http_in_progress_requests gauge",
            f'hrproject_http_in_progress_requests{{branch="{self.branch}"}} {in_progress}',
            "# HELP hrproject_http_requests_total Total HTTP requests.",
            "# TYPE hrproject_http_requests_total counter",
        ]

        for (method, path, status), value in sorted(requests.items()):
            labels = self._labels(method, path, status)
            lines.append(f"hrproject_http_requests_total{{{labels}}} {value}")

        lines.extend(
            [
                "# HELP hrproject_http_request_duration_seconds HTTP request duration in seconds.",
                "# TYPE hrproject_http_request_duration_seconds histogram",
            ]
        )
        for method, path, status in sorted(duration_count):
            labels = self._labels(method, path, status)
            running_total = 0
            for bucket in BUCKETS:
                running_total = duration_buckets.get((method, path, status, bucket), 0)
                lines.append(
                    f'hrproject_http_request_duration_seconds_bucket{{{labels},le="{bucket}"}} {running_total}'
                )
            lines.append(f'hrproject_http_request_duration_seconds_bucket{{{labels},le="+Inf"}} {duration_count[(method, path, status)]}')
            lines.append(f"hrproject_http_request_duration_seconds_sum{{{labels}}} {duration_sum[(method, path, status)]:.6f}")
            lines.append(f"hrproject_http_request_duration_seconds_count{{{labels}}} {duration_count[(method, path, status)]}")

        return "\n".join(lines) + "\n"

    def _labels(self, method: str, path: str, status: str) -> str:
        return (
            f'branch="{self.branch}",'
            f'method="{_escape_label(method)}",'
            f'path="{_escape_label(path)}",'
            f'status_code="{_escape_label(status)}"'
        )


class PrometheusMetricsMiddleware(BaseHTTPMiddleware):
    def __init__(self, app: FastAPI, store: MetricsStore) -> None:
        super().__init__(app)
        self.store = store

    async def dispatch(self, request: Request, call_next):
        if request.url.path == "/metrics":
            return await call_next(request)

        self.store.start_request()
        started_at = time.perf_counter()
        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
            return response
        finally:
            duration = time.perf_counter() - started_at
            route = request.scope.get("route")
            route_path = getattr(route, "path", request.url.path)
            self.store.finish_request(request.method, route_path, status_code, duration)


def setup_metrics(app: FastAPI) -> None:
    branch = os.getenv("METRICS_BRANCH", "unknown")
    store = MetricsStore(branch=branch)
    app.add_middleware(PrometheusMetricsMiddleware, store=store)

    @app.get("/metrics", include_in_schema=False)
    async def metrics() -> PlainTextResponse:
        return PlainTextResponse(store.render(), media_type="text/plain; version=0.0.4")


def _escape_label(value: str) -> str:
    return value.replace("\\", "\\\\").replace("\n", "\\n").replace('"', '\\"')
