
import React from 'react';

const BRAND = '#9B7AF2';

const packages = [
  ['Personal care A', 650, 130, 120, 15600],
  ['Personal care B', 1950, 450, 110, 49500],
  ['Personal care C', 3950, 1100, 100, 49500],
  ['Personal care D', 7950, 2400, 90, 216000],
  ['Personal care E', 15500, 5200, 80, 416000],
  ['Personal care F', 29500, 11000, 70, 770000],
  ['Personal care G', 59500, 28000, 60, 1680000],
  ['Personal care H', 99500, 52000, 50, 2600000]
];

function Packages() {
  const format = value => Number(value).toLocaleString('en-US');

  return (
    <div className="pkg">
      <style>{`
        .pkg{background:#fff;border-radius:15px;overflow:hidden;box-shadow:0 4px 16px #30205d0c;color:#293348}
        .pkg-head{padding:15px;background:linear-gradient(135deg,#9B7AF2,#7651D5);color:#fff}
        .pkg-head h5{font-size:16px;font-weight:900;margin:0}
        .pkg-head p{font-size:11px;margin:4px 0 0;color:#ffffffd9}
        .pkg-table{width:100%;table-layout:fixed;border-collapse:collapse}
        .pkg-table th{background:#F4F0FF;color:#7651D5;font-size:10px;font-weight:900;padding:11px 4px;text-align:center;line-height:1.3}
        .pkg-table td{padding:13px 3px;text-align:center;font-size:11px;font-weight:600;border-bottom:1px solid #f0edf5;white-space:nowrap}
        .pkg-table tbody tr:nth-child(even){background:#faf9ff}
        .pkg-table th:first-child,.pkg-table td:first-child{text-align:left;padding-left:9px;width:27%;font-weight:800}
        .pkg-table th:nth-child(2){width:15%}
        .pkg-table th:nth-child(3){width:19%}
        .pkg-table th:nth-child(4){width:15%}
        .pkg-table th:nth-child(5){width:24%}
        .pkg-table td:last-child{color:#7651D5;font-weight:900}
        .pkg-note{padding:10px;text-align:center;font-size:10px;color:#929aa6;background:#fff}
        @media(max-width:380px){
          .pkg-table th{font-size:8px;padding:10px 2px}
          .pkg-table td{font-size:9px;padding:12px 1px}
          .pkg-table th:first-child,.pkg-table td:first-child{padding-left:5px}
        }
      `}</style>

      <div className="pkg-head">
        <h5><i className="bi bi-box-seam me-2" />BrandCare Packages</h5>
        <p>Product pricing and earnings schedule</p>
      </div>

      <table className="pkg-table">
        <thead>
          <tr>
            <th>PRODUCT</th>
            <th>PRICE</th>
            <th>DAILY<br />EARNINGS</th>
            <th>EARNING<br />DAYS</th>
            <th>TOTAL<br />EARNINGS</th>
          </tr>
        </thead>
        <tbody>
          {packages.map(([name, price, daily, days, total]) => (
            <tr key={name}>
              <td>{name}</td>
              <td>{format(price)}</td>
              <td>{format(daily)}</td>
              <td>{days}</td>
              <td>{format(total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pkg-note">
        <i className="bi bi-info-circle me-1" />
        All amounts are in ETB
      </div>
    </div>
  );
}

export default Packages;
