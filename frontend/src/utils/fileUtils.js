export const detectFileType = (filename) => {
    if (!filename) return '';
    
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'txt':
        return 'text';
      default:
        return '';
    }
  };