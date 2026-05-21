export const unwrapApiData = (response) => {
  return response?.data?.data ?? null;
};

export const unwrapApiMessage = (response) => {
  return response?.data?.message || "Success";
};

export const getApiErrorMessage = (error, fallback = "Something went wrong") => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

export const getApiValidationErrors = (error) => {
  return error?.response?.data?.errors || [];
};