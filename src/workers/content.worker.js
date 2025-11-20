self.addEventListener('message', (e) => {
    const { type, content, encoded } = e.data;
    try {
      if (type === 'encode') {
        const result = btoa(unescape(encodeURIComponent(content)));
        self.postMessage(result);
      }
      if (type === 'decode') {
        const result = decodeURIComponent(escape(atob(encoded)));
        self.postMessage(result);
      }
    } catch (error) {
      self.postMessage(type === 'encode' ? content : encoded);
    }
  });
