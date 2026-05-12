class AppException(Exception):
    """앱 전체 예외의 부모 클래스"""

    status_code: int = 500  # 기본값: 500 Internal Server Error
    code: str = "INTERNAL_SERVER_ERROR"

    def __init__(self, detail: str):
        self.detail = detail


class NotFoundException(AppException):
    """리소스를 찾을 수 없을 때"""
    status_code = 404
    code = "NOT_FOUND"


class BadRequestException(AppException):
    """요청 본문·파라미터가 유효하지 않을 때"""
    status_code = 400
    code = "BAD_REQUEST"


class DuplicateException(AppException):
    """중복된 데이터가 있을 때"""
    status_code = 409
    code = "DUPLICATE_RESOURCE"


class ConflictException(AppException):
    """요청이 현재 리소스 상태와 충돌할 때"""
    status_code = 409
    code = "CONFLICT"


class ExternalServiceException(AppException):
    """External service request failed."""
    status_code = 502
    code = "EXTERNAL_SERVICE_ERROR"


class UnauthorizedException(AppException):
    """인증 실패 (로그인이 안 되었거나 토큰이 유효하지 않을 때)"""
    status_code = 401
    code = "UNAUTHORIZED"


class ForbiddenException(AppException):
    """권한 없음 (로그인은 되었지만 해당 작업을 할 권한이 없을 때)"""
    status_code = 403
    code = "FORBIDDEN"
