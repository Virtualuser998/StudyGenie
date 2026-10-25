const getAIErrorStatus = (error) =>
  Number(
    error?.status
    || error?.response?.status
    || error?.cause?.status
    || error?.cause?.cause?.status
  ) || 0;

const getAIErrorText = (error) =>
  [
    error?.message,
    error?.cause?.message,
    error?.cause?.cause?.message,
    error?.code,
    error?.cause?.code
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const isAIQuotaExhaustedError = (error) =>
  /quota|resource[_\s-]*exhausted|per[_\s-]*day|requests?[_\s-]*per[_\s-]*day|generate_content_free_tier_requests/i
    .test(getAIErrorText(error));

const isTransientAIError = (error) => {
  if (isAIQuotaExhaustedError(error)) return false;

  const status = getAIErrorStatus(error);
  const text = getAIErrorText(error);

  return [408, 425, 429, 500, 502, 503, 504].includes(status)
    || /timeout|fetch failed|network error|econnreset|econnrefused|etimedout|und_err_/.test(text);
};

const getAIErrorResponse = (error) => {
  if (isAIQuotaExhaustedError(error)) {
    return {
      status: 429,
      body: {
        code: "AI_QUOTA_EXHAUSTED",
        message: "The AI provider's daily request quota is exhausted. Wait for it to reset, then reload this page to try again."
      }
    };
  }

  if (getAIErrorStatus(error) === 429) {
    return {
      status: 429,
      body: {
        code: "AI_RATE_LIMITED",
        message: "The AI service is receiving requests too quickly. Please wait a moment before trying again."
      }
    };
  }

  if (isTransientAIError(error)) {
    return {
      status: 503,
      body: {
        code: "AI_TEMPORARILY_UNAVAILABLE",
        message: "The AI service is temporarily unavailable. Please try again shortly."
      }
    };
  }

  return {
    status: 500,
    body: {
      code: "AI_REQUEST_FAILED",
      message: "We couldn't complete the AI request. Please try again."
    }
  };
};

const sendAIError = (res, error) => {
  const response = getAIErrorResponse(error);
  return res.status(response.status).json(response.body);
};

module.exports = {
  getAIErrorResponse,
  isAIQuotaExhaustedError,
  isTransientAIError,
  sendAIError
};
