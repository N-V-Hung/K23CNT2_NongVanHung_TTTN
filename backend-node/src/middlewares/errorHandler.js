export function errorHandler(err, req, res, next) {
  console.error('❌ Error:', err.message);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors,
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field === 'username' ? 'Username' : 'Email'} đã tồn tại`,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'ID không hợp lệ' });
  }

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Lỗi server',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy route: ${req.method} ${req.originalUrl}`,
  });
}