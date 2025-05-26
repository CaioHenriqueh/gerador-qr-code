import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { saveAs } from 'file-saver';
import { FiLink, FiFile, FiDownload, FiX, FiUpload, FiSettings } from 'react-icons/fi';
import { MdPalette } from 'react-icons/md';
import './App.css';

const App = () => {
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('link');
  const [generatedQR, setGeneratedQR] = useState(null);
  const [fileName, setFileName] = useState('');
  const [filePreview, setFilePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [size, setSize] = useState(256);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fgColor, setFgColor] = useState('#000000');
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef(null);
  const qrRef = useRef(null);

  const generateQR = () => {
    if ((activeTab === 'link' && input.trim() === '') || (activeTab === 'file' && !filePreview)) {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      let content = activeTab === 'link' ? input.trim() : URL.createObjectURL(filePreview);
      setGeneratedQR(content);
      setIsLoading(false);
    }, 800);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setFilePreview(file);
    }
  };

  const downloadQR = () => {
    if (!generatedQR) return;

    // Criar canvas temporário para exportação
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = size + 40; // Margem adicional
    canvas.height = size + 40;

    // Fundo branco
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Obter SVG como Data URL
    const svg = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      // Centralizar QR Code no canvas
      const offset = 20;
      ctx.drawImage(img, offset, offset, size, size);

      // Converter para blob e baixar
      canvas.toBlob((blob) => {
        saveAs(blob, `qr-code-${activeTab === 'link' ? 'link' : fileName.replace(/\.[^/.]+$/, "")}.png`);
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const resetForm = () => {
    setInput('');
    setGeneratedQR(null);
    setFileName('');
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="app">
      <div className="glass-container neo-glass">
        <div className="app-header">
          <h1 className="app-title gradient-text">Gerador de QR code</h1>
        </div>

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'link' ? 'active' : ''}`}
            onClick={() => setActiveTab('link')}
          >
            <FiLink className="tab-icon" /> Link
          </button>
          <button
            className={`tab ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => setActiveTab('file')}
          >
            <FiFile className="tab-icon" /> Arquivo
          </button>
        </div>

        <div className="content-container">
          {activeTab === 'link' ? (
            <div className="input-group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="https://exemplo.com"
                className="input-field neo-input"
              />
            </div>
          ) : (
            <div className="file-upload">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                id="file-input"
                className="file-input"
              />
              <label htmlFor="file-input" className="file-label neo-button">
                <FiUpload className="upload-icon" />
                {fileName || 'Selecione um arquivo'}
              </label>
            </div>
          )}

          <button
            className="settings-toggle"
            onClick={() => setShowSettings(!showSettings)}
          >
            <FiSettings /> {showSettings ? 'Ocultar' : 'Personalizar'}
          </button>

          {showSettings && (
            <div className="customization-options neo-inner">
              <div className="section-title">
                <MdPalette /> Personalização
              </div>

              <div className="option-group">
                <label>Tamanho: {size}px</label>
                <input
                  type="range"
                  min="128"
                  max="512"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value))}
                  className="neo-slider"
                />
              </div>

              <div className="color-options">
                <div className="option-group">
                  <label>Cor do QR</label>
                  <div className="color-picker-container">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="neo-color-picker"
                    />
                    <span>{fgColor}</span>
                  </div>
                </div>

                <div className="option-group">
                  <label>Fundo</label>
                  <div className="color-picker-container">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="neo-color-picker"
                    />
                    <span>{bgColor}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="action-buttons">
            <button
              onClick={generateQR}
              className="generate-btn neo-button"
              disabled={isLoading || (activeTab === 'link' && !input.trim()) || (activeTab === 'file' && !filePreview)}
            >
              {isLoading ? (
                <span className="loading-dots">
                  <span>.</span><span>.</span><span>.</span>
                </span>
              ) : (
                'Gerar QR Code'
              )}
            </button>

            <button onClick={resetForm} className="reset-btn neo-button">
              <FiX /> Limpar
            </button>
          </div>
        </div>

        {generatedQR && (
          <div className="result-container">
            <div className="qr-code-wrapper neo-inner" ref={qrRef}>
              <QRCodeSVG
                value={generatedQR}
                size={size}
                bgColor={bgColor}
                fgColor={fgColor}
                level="H"
                includeMargin={true}
              />
            </div>

            <button onClick={downloadQR} className="download-btn neo-button">
              <FiDownload /> Baixar QR Code
            </button>
          </div>
        )}
      </div>

      <div className="app-footer">
        <p>© {new Date().getFullYear()} Caio Dev | Tecnologia de Ponta</p>
      </div>
    </div>
  );
};

export default App;