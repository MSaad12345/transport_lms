class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200, meta = undefined) {
    const body = { success: true, message, data };
    if (meta !== undefined) body.meta = meta;
    return res.status(statusCode).json(body);
  }

  static created(res, data = null, message = 'Created') {
    return this.success(res, data, message, 201);
  }

  static fail(res, message = 'Request failed', statusCode = 400, details = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      details,
    });
  }
}

module.exports = ApiResponse;
