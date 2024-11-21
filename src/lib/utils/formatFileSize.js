const formatFileSize = (bytes, precision = 2, separator = " ") => {
  if (bytes === -1) {
    return "∞";
  }

  const units = ["B", "kB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // Format number based on decimal rules
  const fixed = size.toFixed(precision);
  const formatted = fixed.endsWith(".00") ? Math.floor(size).toString() : fixed.endsWith(".50") ? (Math.floor(size) + ".5").toString() : fixed;

  return `${formatted}${separator}${units[unitIndex]}`;
};

export default formatFileSize;
