import './App.css';
import PatientList from './components/PatientList';
import Card from 'react-bootstrap/Card';
function App() {
  return (
    <div className="App">
      <Card style={{ margin: '10vh' }}>
        <Card.Body>
          <Card.Title>Patient List</Card.Title>
          <PatientList />
        </Card.Body>
      </Card>
    </div>
  );
}

export default App;
