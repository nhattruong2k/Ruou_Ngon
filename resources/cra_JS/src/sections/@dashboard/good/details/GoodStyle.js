import { Font, StyleSheet } from '@react-pdf/renderer';

// ----------------------------------------------------------------------

Font.register({
  family: 'Roboto',
  fonts: [{ src: '/fonts/Roboto-Regular.ttf' }, { src: '/fonts/Roboto-Bold.ttf' }],
});

const styles = StyleSheet.create({
  col4: { width: '25%' },
  col8: { width: '75%' },
  col10: { width: '100%' },
  col6: { width: '50%' },
  mb1: { marginBottom: 1 },
  mb8: { marginBottom: 81 },
  mb5: { marginBottom: 5 },
  mb4: { marginBottom: 4 },
  mb15: { marginBottom: 15 },
  overline: {
    fontSize: 8.5,
    textTransform: 'uppercase',
  },
  h3: { fontSize: 16, fontWeight: 700 },
  h4: { fontSize: 13, fontWeight: 700, align: 'center' },
  h5: { fontSize: 11, fontWeight: 700 },
  h6: { fontSize: 10, fontWeight: 700 },
  body1: { fontSize: 10 },
  subtitle2: { fontSize: 9, fontWeight: 700 },
  alignRight: { textAlign: 'right' },
  alignCenter: { textAlign: 'center' },
  fontWeightBold: { fontWeight: 'bold' },
  page: {
    padding: '40px 24px 0 24px',
    fontSize: 9,
    lineHeight: 1.6,
    fontFamily: 'Roboto',
    backgroundColor: '#fff',
    textTransform: 'capitalize',
  },

  backgroundColorRed: { backgroundColor: 'red' },
  backgroundColorWhite: { backgroundColor: 'white' },

  footer: {
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    margin: 'auto',
    borderTopWidth: 1,
    borderStyle: 'solid',
    position: 'absolute',
    borderColor: '#DFE3E8',
  },
  gridContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  table: { display: 'flex', width: 'auto' },
  tableHeader: {},
  tableBody: {},
  tableRow: {
    padding: '8px 0',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderStyle: 'solid',
    borderColor: '#DFE3E8',
  },
  noBorder: { paddingTop: 8, paddingBottom: 0, borderBottomWidth: 0 },
  tableCell_1: { width: '5%', align: 'center' },
  tableCell_2: { width: '8%', align: 'center' },
  tableCell_3: { width: '20%', align: 'center' },
  tableCell_4: { width: '10%', align: 'center' },
  tableCell_5: { width: '20%', align: 'center' },
  tableCell_6: { width: '10%', align: 'center' },
  tableCell_7: { width: '10%', align: 'center' },
  tableCell_8: { width: '15%', align: 'center' },

});

export default styles;
