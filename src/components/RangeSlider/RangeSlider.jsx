import React, { useState } from 'react';

const RangeSlider = ({ onChange }) => {
  const [rangeStart, setRangeStart] = useState(100);
  const [rangeEnd, setRangeEnd] = useState(300);
  const [dragging, setDragging] = useState(null);
  const [startX, setStartX] = useState(0);

  const onMouseMove = (e) => {
    if (dragging === 'start') {
      const newStart = Math.min(rangeEnd - 20, Math.max(0, rangeStart + (e.clientX - startX)));
      setRangeStart(newStart);
      setStartX(e.clientX);
      onChange(newStart, rangeEnd);
    } else if (dragging === 'end') {
      const newEnd = Math.max(rangeStart + 20, Math.min(500, rangeEnd + (e.clientX - startX)));
      setRangeEnd(newEnd);
      setStartX(e.clientX);
      onChange(rangeStart, newEnd);
    } else if (dragging === 'range') {
      const delta = e.clientX - startX;
      if (rangeStart + delta >= 0 && rangeEnd + delta <= 500) {
        setRangeStart(rangeStart + delta);
        setRangeEnd(rangeEnd + delta);
        setStartX(e.clientX);
        onChange(rangeStart + delta, rangeEnd + delta);
      }
    }
  };

  const onMouseDown = (type, e) => {
    setDragging(type);
    setStartX(e.clientX);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseUp = () => {
    setDragging(null);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="slider-container" style={{ position: 'relative', width: '500px', height: '50px',zIndex:900 }}>
      <div style={{ position: 'absolute', top: '20px', left: '0', width: '100%', height: '10px', background: '#ddd' }} />
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: `${rangeStart}px`,
          width: `${rangeEnd - rangeStart}px`,
          height: '10px',
          background: 'lightblue',
          cursor: 'grab',
        }}
        onMouseDown={(e) => onMouseDown('range', e)}
      />
      <div
        style={{
          position: 'absolute',
          top: '15px',
          left: `${rangeStart - 5}px`,
          width: '10px',
          height: '20px',
          background: 'navy',
          cursor: 'pointer',
        }}
        onMouseDown={(e) => onMouseDown('start', e)}
      />
      <div
        style={{
          position: 'absolute',
          top: '15px',
          left: `${rangeEnd - 5}px`,
          width: '10px',
          height: '20px',
          background: 'navy',
          cursor: 'pointer',
        }}
        onMouseDown={(e) => onMouseDown('end', e)}
      />
    </div>
  );
};

export default RangeSlider;
