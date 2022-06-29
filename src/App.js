import React, { useRef, useState } from "react";
import Particle from "./component/Particle";
import './App.css';



export default function App() {
  const fileRef = useRef();

  const handleChange = (e) => {
    const [file] = e.target.files;
    console.log(file);
  };

  return (
    <>
    <Particle/>
    <div className="upload">
      <h1 style={{color: "black"}} >Retinal image</h1>

      <button onClick={() => fileRef.current.click()}>
        Upload Image !!!
      </button>
      <input
        ref={fileRef}
        onChange={handleChange}
        multiple={false}
        type="file"
        hidden
      />
    </div>
    </>
  );
}