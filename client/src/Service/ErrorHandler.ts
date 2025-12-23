import axios from "axios";

export const handleError = (error) => {
  if (
    error?.name === "AbortError" ||
    error?.name === "CanceledError" ||
    error?.code === "ERR_CANCELED"
  ) {
    console.warn("Request aborted – ignoring error");
    return;
  }
  if (axios.isCancel(error)) {
    console.log("Request cancelled", error.message);
    return;
  }

  if ( error instanceof Error && error.message.includes("Cannot read properties of undefined") ) {
    console.warn("Axios internal error ignored:", error.message);
    return;
  }


  if (error?.response) {
    const status = error.response.status;
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      "Request failed";

    if (status === 429) {
      throw new Error("Too many requests. Please wait.");
    }

    if (status === 403) {
      throw new Error(message || "Access forbidden");
    }

    if (status === 401) {
      throw new Error(message || "Unauthorized");
    }

    throw new Error(message);
  }

  // Fallback (network / unknown error)
  throw new Error(
    typeof error?.message === "string"
      ? error.message
      : "An unexpected error occurred"
  );
};