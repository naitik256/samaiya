body {
  font-family: 'Poppins', sans-serif;
  background: #111;
  color: #fff;
  text-align: center;
  margin: 0;
  padding: 0;
}

.container {
  margin-top: 30px;
  padding: 20px;
}

.real-flip-clock {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin: 20px 0 40px;
}

.digit-group {
  display: flex;
  gap: 6px;
}

.colon {
  font-size: 2.5rem;
  color: #00cec9;
  padding: 0 8px;
}

.flip-digit {
  perspective: 1000px;
  width: 50px;
  height: 70px;
}

.card {
  width: 100%;
  height: 100%;
  position: relative;
  background: #000;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.card .top,
.card .bottom {
  position: absolute;
  width: 100%;
  height: 50%;
  background: #00cec9;
  color: #111;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2.5rem;
  font-weight: bold;
  backface-visibility: hidden;
  transform-style: preserve-3d;
  transition: transform 0.6s ease-in-out;
}

.card .top {
  top: 0;
  border-bottom: 1px solid #008b85;
  transform-origin: bottom;
}

.card .bottom {
  bottom: 0;
  border-top: 1px solid #008b85;
  transform-origin: top;
}

.flip-digit.flip .top {
  transform: rotateX(-90deg);
}

.flip-digit.flip .bottom {
  transform: rotateX(0deg);
}

.controls button {
  padding: 10px 20px;
  font-size: 1em;
  background-color: #00cec9;
  color: black;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

#status {
  margin-top: 20px;
  font-weight: bold;
}

.report {
  margin-top: 30px;
  text-align: left;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

footer {
  margin-top: 40px;
  font-size: 0.9em;
  color: #aaa;
}

footer a {
  color: #00cec9;
  text-decoration: none;
}

footer a:hover {
  text-decoration: underline;
}

.info-section {
  padding: 20px;
  font-size: 0.9em;
  max-width: 600px;
  margin: 0 auto;
  color: #ccc;
}
