const http = require('http');

http.get('http://localhost:3000/api/medicines?category=Antibiotics', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log('Status Code:', res.statusCode);
      if (parsed.data && parsed.data.length > 0) {
        console.log('First Product Keys:', Object.keys(parsed.data[0]));
        console.log('First Product Side Effects:', parsed.data[0].sideEffects);
      } else {
        console.log('Parsed API Response:', parsed);
      }
    } catch(e) {
      console.log('Error parsing JSON:', e);
      console.log('Raw output:', data.substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
