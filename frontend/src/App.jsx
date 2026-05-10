import { useEffect, useState } from 'react'
import './App.css'

function App() {

  const [data, setData] = useState(null);

  useEffect(() => {

    fetch(`${import.meta.env.VITE_API_URL}/test.php`)
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => console.error(err));

  }, []);

  return (
    <div>

      <h1>Prueba Backend</h1>

      <pre>
        {JSON.stringify(data, null, 2)}
      </pre>

    </div>
  );
}

export default App;
