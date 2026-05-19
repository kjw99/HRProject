/**
 * input / textarea 안의 특정 인덱스(보통 selectionStart)에 해당하는
 * 캐럿(텍스트 커서)의 viewport 절대 좌표를 측정한다.
 *
 * 구현 방식: hidden mirror div 에 동일한 box/text 스타일을 복사하고,
 * 캐럿 위치까지의 텍스트 + zero-width span 을 그려서 span 의 픽셀 위치를 측정한다.
 * (textarea-caret-position 라이브러리에서 사용하는 표준 기법)
 *
 * 단점: input/textarea 의 모든 typography 영향 속성을 복사해야 정확.
 *      아래 PROPS_TO_COPY 가 그 목록.
 */

/**
 * mirror 에 복사할 typography/box 속성. camelCase 형태로 두고 측정 시 kebab-case 로 변환.
 */
const PROPS_TO_COPY: readonly string[] = [
  "boxSizing",
  "width",
  "height",
  "overflowX",
  "overflowY",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "borderStyle",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontStyle",
  "fontVariant",
  "fontWeight",
  "fontStretch",
  "fontSize",
  "fontSizeAdjust",
  "lineHeight",
  "fontFamily",
  "textAlign",
  "textTransform",
  "textIndent",
  "textDecoration",
  "letterSpacing",
  "wordSpacing",
  "tabSize",
];

const toKebabCase = (camel: string): string =>
  camel.replace(/[A-Z]/g, (match: string) => `-${match.toLowerCase()}`);

export interface CaretMeasurement {
  /** viewport 기준 캐럿 좌측 (px) */
  caretLeft: number;
  /** viewport 기준 캐럿 상단 (px) */
  caretTop: number;
  /** 한 줄 높이 (dropdown 을 캐럿 아래로 띄울 때 오프셋 용도) */
  lineHeight: number;
}

const isTextarea = (
  el: HTMLInputElement | HTMLTextAreaElement,
): el is HTMLTextAreaElement => el.tagName === "TEXTAREA";

/**
 * @returns 측정 실패 시 null
 */
export function measureCaretPosition(
  element: HTMLInputElement | HTMLTextAreaElement,
  caretIndex: number,
): CaretMeasurement | null {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  const elementRect = element.getBoundingClientRect();
  const computed = window.getComputedStyle(element);

  const mirror = document.createElement("div");
  const style = mirror.style;

  // 화면 밖에 숨겨두기
  style.position = "absolute";
  style.visibility = "hidden";
  style.top = "0";
  style.left = "0";
  style.whiteSpace = "pre-wrap";
  style.wordWrap = "break-word";
  if (!isTextarea(element)) {
    // input 은 줄바꿈이 발생하지 않도록
    style.whiteSpace = "pre";
    style.overflow = "hidden";
  }

  for (const prop of PROPS_TO_COPY) {
    const value = computed.getPropertyValue(toKebabCase(prop));
    if (value) {
      style.setProperty(toKebabCase(prop), value);
    }
  }

  const textBefore = element.value.substring(0, caretIndex);
  mirror.textContent = textBefore;

  /**
   * input 은 leading space 가 collapse 될 수 있어 visibility 가 깨지므로
   * 마지막 공백을 nbsp 로 치환
   */
  if (!isTextarea(element)) {
    mirror.textContent = mirror.textContent.replace(/\s/g, "\u00a0");
  }

  const caretSpan = document.createElement("span");
  // 너비를 가지지 않도록 zero-width 문자 사용 (단순 빈 문자열은 width 0 → 일부 브라우저에서 offset 0)
  caretSpan.textContent = element.value.substring(caretIndex) || ".";
  if (!caretSpan.textContent) caretSpan.textContent = ".";
  mirror.appendChild(caretSpan);

  document.body.appendChild(mirror);

  let measurement: CaretMeasurement | null = null;
  try {
    const spanOffsetLeft = caretSpan.offsetLeft;
    const spanOffsetTop = caretSpan.offsetTop;

    // textarea 의 스크롤 보정
    const scrollLeft = element.scrollLeft;
    const scrollTop = element.scrollTop;

    const borderLeft = parseFloat(computed.borderLeftWidth) || 0;
    const borderTop = parseFloat(computed.borderTopWidth) || 0;

    const caretLeft =
      elementRect.left + borderLeft + spanOffsetLeft - scrollLeft;
    const caretTop =
      elementRect.top + borderTop + spanOffsetTop - scrollTop;

    const lineHeight =
      parseFloat(computed.lineHeight) ||
      parseFloat(computed.fontSize) * 1.2 ||
      18;

    measurement = { caretLeft, caretTop, lineHeight };
  } catch {
    measurement = null;
  } finally {
    document.body.removeChild(mirror);
  }

  return measurement;
}
