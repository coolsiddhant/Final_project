import React, { useRef, useState, useEffect, Fragment } from "react";
import { loadLayersModel, browser } from "@tensorflow/tfjs";
import ImageNetClass from './ImageNetClass';
import Particle from "./component/Particle";
import './App.css';

export default function App() {
  const [model, setModel] = useState(null);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    const loadModel = async () => {
      let _model = await loadLayersModel("./model/json/model.json");
      setModel(_model);
      console.log("model loaded successfully");
    };
    loadModel().catch(console.error);
  }, []);

  const handleChange = (e) => {
    e.preventDefault();
    setResult(null);

    if (e.target.files && e.target.files.length > 0) {
      var file = e.target.files[0];
      let reader = new FileReader();
      reader.onload = async () => {
        let dataURL = reader.result;
        let image = document.createElement("img");
        image.width = 128;
        image.height = 128;
        image.src = dataURL;
        let tensor = browser.fromPixels(image)
          .resizeNearestNeighbor([128, 128])
          .toFloat()
          .expandDims();

        let predictions = await model.predict(tensor).data();
        let top = 1;
        let results = [];
        for (let i = 0; i < 128; i++) {
          let val = predictions.slice(i * 128, i * 128 + 128);
          let top_index = Array.from(val)
            .map((x, i) => {
              return { index: i, value: x };
            })
            .sort((a, b) => b.value - a.value)
            .slice(0, top)

          results = results.concat(top_index.map((x) => {
            return { ...x, name: ImageNetClass[x.index] };
          }).sort((a, b) => b.value - a.value));
        }
        results = results.reduce((acc, curr) => {
          let name = curr['name'][1];
          if (acc.hasOwnProperty(name)) {
            acc[name] += 1;
          } else {
            acc[name] = 1;
          }
          return acc;
        }, {});
        results = Object.keys(results).map(function (key) {
          return [key, results[key]];
        }).sort((a, b) => b[1] - a[1]);
        setResult(results[0]);
      }
      reader.readAsDataURL(file);
    }
  };

  return (
    <Fragment>
      <Particle />
      <div className="upload">
        <h1 style={{ color: "black" }}>Retinal image</h1>
        <button onClick={() => fileRef.current.click()}>
          Upload Image !!!
        </button>
        <input
          ref={fileRef}
          onChange={handleChange}
          multiple={false}
          type="file"
          accept="image/x-png,image/gif,image/jpeg"
          hidden
        />
        {result ?
          <div style={{ fontSize: "32px" }}>Result: {result}</div>
          : <></>}
      </div>
    </Fragment>
  );
}