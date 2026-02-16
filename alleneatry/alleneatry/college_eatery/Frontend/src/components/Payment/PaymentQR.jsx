import React, { useMemo } from 'react';
import './PaymentQR.css';
import { QRCodeSVG } from 'qrcode.react';

/*
  Basic UPI QR format:
  upi://pay?pa=<vpa>&pn=<name>&am=<amount>&cu=INR&tn=<note>
*/

const PaymentQR = ({ amount, vpa, payeeName, note = 'AllenEatery Order', tokenNumber, itemsCount, items = [] }) => {
  const upiString = `upi://pay?pa=kashyaprishabh8957@okicici&pn=AllenEatery&cu=INR`;

  const handleDownloadToken = () => {
    const width = 600;
    const height = 300;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, width - 16, height - 16);

    // Header - AllenEatery branding
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AllenEatery', width / 2, 80);

    // Token label
    ctx.font = 'bold 28px Arial';
    ctx.fillStyle = '#444444';
    ctx.fillText('Pickup Token', width / 2, 130);

    // Token number
    ctx.font = 'bold 72px Arial';
    ctx.fillStyle = '#111111';
    ctx.fillText(String(tokenNumber || '----'), width / 2, 210);

    // Footer note
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666666';
    const date = new Date();
    ctx.fillText(date.toLocaleString(), width / 2, 260);

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `allen-eatery-token-${tokenNumber || 'token'}.png`;
    link.click();
  };

  return (
    <div className="qr-container">
      <h3>Scan & Pay (UPI)</h3>
      <div className="qr-box">
        <QRCodeSVG value={upiString} size={180} includeMargin={true} />
      </div>
      <div className="qr-details">
        <div className="row"><span>Payee:</span><b>{payeeName}</b></div>
        <div className="row"><span>VPA:</span><b>{vpa}</b></div>
        <div className="row"><span>Amount:</span><b>₹{amount}</b></div>
      </div>

      <div className="receipt">
        <h4>Receipt</h4>
        <div className="row"><span>Items:</span><b>{itemsCount}</b></div>
        {items && items.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {items.map((it, idx) => (
              <div key={idx} className="row" style={{ fontSize: 13 }}>
                <span>{it.name} x {it.quantity}</span>
                <b>₹{it.subtotal}</b>
              </div>
            ))}
            <div className="row" style={{ fontWeight: 600, borderTop: '1px solid #eaeaea', paddingTop: 6, marginTop: 6 }}>
              <span>Total</span>
              <b>₹{amount}</b>
            </div>
          </div>
        )}
        <div className="row token"><span>Token:</span><b>{tokenNumber}</b></div>
        <button type="button" className="download-btn" onClick={handleDownloadToken}>Download Token</button>
      </div>

      <p className="hint">Show this token at the canteen counter to receive your order.</p>
    </div>
  );
};

export default PaymentQR;
