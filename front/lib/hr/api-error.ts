interface ApiErrorShape {
  response?: { data?: { message?: string; detail?: string } };
  message?: string;
}

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const maybe = error as ApiErrorShape;

  return (
    maybe.response?.data?.message ||
    maybe.response?.data?.detail ||
    maybe.message ||
    fallback
  );
};
