import React from 'react';
import moment from 'moment';
import { getText } from '../../../../utils/number-to-text-vietnamese/index';

function currencyFormatter(params) {
  return formatNumber(params.value === '' || typeof params.value === 'undefined' ? 0 : params.value);
}

function formatNumber(number) {
  return Math.floor(number)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}

export default (props) => {
  const currentSaleReceipt = props.data;
  let warehouseAddress = [
    currentSaleReceipt?.warehouse?.address || '',
    currentSaleReceipt?.warehouse?.ward || '',
    currentSaleReceipt?.warehouse?.district || '',
    currentSaleReceipt?.warehouse?.province || '',
  ];
  warehouseAddress = warehouseAddress.filter((word) => word !== '').join(', ') || '';

  let partyAddress = [
    currentSaleReceipt?.party?.address || '',
    currentSaleReceipt?.party?.ward?.name || '',
    currentSaleReceipt?.party?.district?.name || '',
    currentSaleReceipt?.party?.province?.name || '',
  ];
  partyAddress = partyAddress.filter((word) => word !== '').join(', ') || '';

  const dataRender = {
    warehouseName: currentSaleReceipt?.warehouse?.name || '',
    warehouseAddress,
    date: currentSaleReceipt?.date ? moment(currentSaleReceipt?.date).format('DD-MM-YYYY') : '',
    code: currentSaleReceipt?.code || '',
    employee: currentSaleReceipt?.employee?.name || '',
    party: currentSaleReceipt?.party?.name || '',
    partyAddress,
    comment: currentSaleReceipt?.comment || '',
    order_items: currentSaleReceipt?.order_items || [],
  };

  const calculateTotalPrice = (data) => {
    let totalPrice = 0;
    for (let i = 0; i < data?.order_items?.length; i += 1) {
      totalPrice += Number(data.order_items[i].price * data.order_items[i].quantity);
    }
    return totalPrice;
  };

  return (
    <div style={styles.hidecontainer}>
      <div id="print-page" style={{ fontFamily: 'sans-serif', fontSize: '10pt' }}>
        <section>
          <p style={{ textTransform: 'capitalize' }}>{dataRender.warehouseName}</p>
          <p style={{ textTransform: 'capitalize' }}>{dataRender.warehouseAddress}</p>
        </section>
        <section style={styles.header}>
          <h1>Phiếu Xuất Kho</h1>
          <div style={styles.headerDescription}>
            <div style={styles.headerContent} />
            <div style={styles.headerContentDate}>
              <p style={styles.tagP}>Ngày: {dataRender.date}</p>
            </div>
            <div style={styles.headerContentCode}>
              <p style={styles.tagP}>Số: {dataRender.code}</p>
            </div>
          </div>
        </section>
        <section>
          <div style={styles.infoCustomer}>
            <p style={styles.infoCustomerLabel}>Người bán hàng: </p>
            <p style={styles.tagP}>{dataRender.employee}</p>
          </div>
          <div style={styles.infoCustomer}>
            <p style={styles.infoCustomerLabel}>Khách hàng: </p>
            <p style={styles.tagP}>{dataRender.party}</p>
          </div>
          <div style={styles.infoCustomer}>
            <p style={styles.infoCustomerLabel}>Địa chỉ: </p>
            <p style={styles.tagP}>{dataRender.partyAddress}</p>
          </div>
          <div style={styles.infoCustomer}>
            <p style={styles.infoCustomerLabel}>Ghi chú: </p>
            <p style={{ margin: 0 }}>{dataRender.comment}</p>
          </div>
        </section>

        <section>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableTr}>
                <th style={styles.tableTrTh} rowSpan="1" colSpan="1">
                  STT
                </th>
                <th style={styles.tableTrTh} rowSpan="1" colSpan="1">
                  Mã Kho
                </th>
                <th style={styles.tableTrTh} rowSpan="1" colSpan="1">
                  Mã Vật Tư
                </th>
                <th style={styles.tableTrTh} rowSpan="1" colSpan="1">
                  Tên Vật Tư
                </th>
                <th style={styles.tableTrTh} rowSpan="1" colSpan="1">
                  ĐVT
                </th>
                <th style={styles.tableTrTh} rowSpan="1" colSpan="1">
                  SL
                </th>
                <th style={styles.tableTrTh} rowSpan="1" colSpan="1">
                  Đơn Giá
                </th>
                <th style={styles.tableTrTh} rowSpan="1" colSpan="1">
                  Thành Tiền
                </th>
              </tr>
            </thead>
            <tbody>
              {dataRender?.order_items?.map((value, index) => (
                <tr key={index}>
                  <td style={styles.tableTbodyTD}>{index + 1}</td>
                  <td style={styles.tableTbodyTD}>{value?.internal_org?.code || ''}</td>
                  <td style={styles.tableTbodyTD}>{value?.good?.code || ''}</td>
                  <td style={styles.tableTbodyTD}>{value?.good?.name || ''}</td>
                  <td style={styles.tableTbodyTD}>{value?.good?.unit_of_measure?.name || ''}</td>
                  <td style={{ ...styles.tableTbodyTD, textAlign: 'right' }}>{value?.quantity}</td>
                  <td style={{ ...styles.tableTbodyTD, textAlign: 'right' }}>
                    {currencyFormatter({ value: value?.good?.price }) || 0}
                  </td>
                  <td style={{ ...styles.tableTbodyTD, textAlign: 'right' }}>
                    {currencyFormatter({ value: value?.price })}
                  </td>
                </tr>
              ))}

              <tr>
                <td
                  style={{
                    fontWeight: 'bold',
                    textAlign: 'center',
                    border: '1px solid black',
                    borderWidth: '1px',
                  }}
                  colSpan="7"
                >
                  Tổng cộng
                </td>
                <td style={{ ...styles.tableTbodyTD, textAlign: 'right' }}>
                  {currencyFormatter({ value: calculateTotalPrice(currentSaleReceipt) })}
                </td>
              </tr>
            </tbody>
          </table>
          <p style={{ textAlign: 'right', textTransform: 'capitalize' }}>
            (Bằng chữ: {getText(calculateTotalPrice(currentSaleReceipt) || 0)})
          </p>
        </section>
        <section>
          <p style={{ textAlign: 'right', paddingRight: '60px' }}>Ngày ...... Tháng ...... Năm ......</p>
        </section>
        <section style={styles.footer}>
          <div style={styles.footerCol}>
            <p style={styles.footerColValue}>NGƯỜI LẬP PHIẾU</p>
            <p style={styles.footerColName}>(Ký, ghi rõ họ tên)</p>
          </div>
          <div style={styles.footerCol}>
            <p style={styles.footerColValue}>NGƯỜI NHẬN HÀNG</p>
            <p style={styles.footerColName}>(Ký, ghi rõ họ tên)</p>
          </div>
          <div style={styles.footerCol}>
            <p style={styles.footerColValue}>THỦ KHO</p>
            <p style={styles.footerColName}>(Ký, ghi rõ họ tên)</p>
          </div>
          <div style={styles.footerCol}>
            <p style={styles.footerColValue}>KẾ TOÁN</p>
            <p style={styles.footerColName}>(Ký, ghi rõ họ tên)</p>
          </div>
        </section>
      </div>
    </div>
  );
};

const styles = {
  body: {
    padding: '20px',
    margin: 0,
  },
  hidecontainer: {
    display: 'none',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftColumn: {
    textAlign: 'left',
  },
  rightColumn: {
    textAlign: 'right',
  },
  colInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  warehouseName: {
    fontWeight: 700,
    lineHeight: '20px',
    padding: 0,
    margin: 0,
    fontSize: '13px',
  },
  warehouseAddress: {
    lineHeight: '20px',
    padding: 0,
    margin: 0,
    fontSize: '11px',
  },
  warehouseCity: {
    lineHeight: '20px',
    padding: 0,
    margin: 0,
    fontSize: '11px',
  },
  warehousePhone: {
    lineHeight: '20px',
    padding: 0,
    margin: 0,
    fontSize: '11px',
  },
  logo: {
    width: 120,
    paddingLeft: 30,
  },
  arrowContainer: {
    width: '200px',
    color: 'white',
    position: 'relative',
    fontWeight: '700',
    textAlign: 'center',
    border: '15px solid #404040',
  },
  arrowSpan: {
    position: 'absolute',
    top: '-8px',
    left: '10px',
    fontSize: '12px',
  },
  arrowBefore: {
    content: '',
    position: 'absolute',
    top: '-15px',
    width: '0',
    height: '0',
    borderStyle: 'solid',
    borderWidth: '15px 0 15px 22px',
    right: '-36px',
    borderColor: 'transparent transparent transparent #404040',
    zIndex: '1',
  },
  arrowLine: {
    border: '1px solid #404040',
    zIndex: '-1',
    marginTop: '-16px',
  },
  titleday: {
    textAlign: 'right',
    lineHeight: '20px',
    padding: '20px 0 0px 0',
    fontSize: '13px',
  },
  textCT: {
    fontWeight: 700,
  },
  titleexport: {
    textAlign: 'center',
    padding: '0px',
    fontWeight: 700,
    color: 'black',
    fontSize: '18px',
  },
  titleBlock: {
    display: 'block',
  },
  containerInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '13px',
  },
  infoKey: {
    flex: 1.5,
    padding: 0,
    margin: 0,
    lineHeight: '30px',
  },
  infoValue: {
    flex: 8.5,
    borderBottom: '1px dotted black',
    padding: 0,
    margin: 0,
    lineHeight: '30px',
  },
  infofontweight: {
    fontWeight: 700,
  },
  leftColumnInfo: {
    flex: 5,
    padding: 0,
    margin: 0,
    lineHeight: '30px',
  },
  rightColumnInfo: {
    flex: 5,
    padding: 0,
    margin: 0,
    lineHeight: '30px',
  },
  infoPhoneKey: {
    flex: 3.5,
    padding: 0,
    margin: 0,
    lineHeight: '30px',
  },
  infoPhoneValue: {
    flex: 8,
    borderBottom: '1px dotted black',
    padding: 0,
    margin: 0,
    lineHeight: '30px',
  },
  infoEmailKey: {
    flex: 0,
    padding: 0,
    margin: 0,
    lineHeight: '30px',
  },
  infoEmailValue: {
    flex: 10,
    borderBottom: '1px dotted black',
    padding: 0,
    margin: 0,
    lineHeight: '30px',
  },
  table: {
    marginTop: '10px',
    marginBottom: '10px',
    borderSpacing: 0,
    borderCollapse: 'collapse',
    width: '100%',
    maxWidth: '100%',
    border: '1px solid #f4f4f4',
    backgroundColor: 'transparent',
    fontSize: '13px',
  },
  tableTr: {
    backgroundColor: '#cdcdcd',
    color: '#333333',
  },
  tableTrTh: {
    padding: '2px',
    lineHeight: '1.42857',
    border: '1px solid black',
    borderWidth: '1px 1px 1px 1px',
  },
  tableTbodyTD: {
    padding: '2px',
    lineHeight: '1.42857143',
    border: '1px solid black',
    borderWidth: '1px 1px 1px 1px',
  },
  numberToText: {
    padding: 0,
    margin: 0,
    lineHeight: '25px',
  },
  footer: {
    marginTop: '30px',
    display: 'flex',
    justifyContent: 'center',
  },
  footerCol: {
    flex: 1,
    textAlign: 'center',
  },
  footerColValue: {
    padding: 0,
    margin: 0,
    fontWeight: 700,
    fontSize: '14px',
  },
  footerColName: {
    padding: 0,
    margin: 0,
    fontStyle: 'italic',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '20px',
  },
  headerDescription: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  headerContent: {
    flex: 1,
  },
  headerContentDate: {
    flex: 1,
    textAlign: 'center',
  },
  headerContentCode: {
    flex: 1,
    textAlign: 'right',
  },
  tagP: {
    textTransform: 'capitalize',
    margin: 0,
  },
  infoCustomer: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: '10px',
  },
  infoCustomerLabel: {
    width: '130px',
    margin: 0,
  },
};
