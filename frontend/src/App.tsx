import "./App.css";
import { Button } from "./components/ui/button";

function App() {
  return (
    <div className="bg-gray-900 flex justify-center items-center h-screen">
      <h1 className="text-3xl font-bold underline text-slate-300">
        Hello world!
      </h1>
      <Button variant="secondary">Button</Button>
    </div>
  );
}

export default App;
