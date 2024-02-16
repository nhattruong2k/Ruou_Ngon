/* eslint-disable jsx-a11y/alt-text */
import PropTypes from 'prop-types';

import { Page, View, Text, Image, Document } from '@react-pdf/renderer';
// utils
import { currencyFormatter } from '../../../../utils/formatNumber';

//
import styles from './GoodStyle';
import ImageExport from './ImageExport';
import { HOST_ASSETS_URL } from '../../../../config';
import { FOLDER_IMAGE } from '../../../../utils/constant';
// ----------------------------------------------------------------------
GoodPDF.propTypes = {
    invoice: PropTypes.array,
};

export default function GoodPDF({ invoice }) {
    let stt = 0;
    const year = new Date().getFullYear();
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={[styles.gridContainer, styles.mb15]}>
                    <Image source="/logo/ruoungon.png" style={{ width: 130, height: 'auto' }} />
                    <View style={{ alignItems: 'center', flexDirection: 'column', marginTop: '15px' }}>
                        <Text style={[styles.h6]}>CÔNG TY TNHH RƯỢU NGON</Text>
                        <Text> Trụ sở: 100 Hàm Nghi, P. Thạc Gián, Q. Thanh Khê, TP Đà Nẵng</Text>
                        <Text>Chi nhánh phía Nam: 208 Đặng Văn Bi, P. Bình Thọ, TP. Thủ Đức</Text>
                        <Text>Chi nhánh phía Bắc:07 TT4 KĐT Xuân Phương, Q. NamTừ Liêm, TP. Hà Nội</Text>
                        <Text>Điện thoại: 0236. 3656699 Fax: 0236. 3714890 Hotline: 0862.994779</Text>
                        <Text>**********************</Text>
                    </View>
                </View>
                <View style={{ width: "-webkit-fill-available" }[styles.mb15]} >
                    <View style={{ alignItems: 'center', flexDirection: 'column' }}>
                        <Text style={[styles.h4]}>BẢNG BÁO GIÁ RƯỢU {year}</Text>
                    </View>
                </View>
                <View style={[styles.gridContainer, styles.mb15]}>
                    <View style={[styles.col6, styles.h6]}>
                        <Text>Kính gửi: QUÝ KHÁCH HÀNG</Text>
                    </View>
                </View>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <View style={styles.tableRow}>
                            <View style={styles.tableCell_1}>
                                <Text style={styles.subtitle2}>Stt</Text>
                            </View>

                            <View style={styles.tableCell_2}>
                                <Text style={styles.subtitle2}>Mã SP</Text>
                            </View>

                            <View style={styles.tableCell_3}>
                                <Text style={styles.subtitle2}>Tên sản phẩm</Text>
                            </View>

                            <View style={styles.tableCell_4}>
                                <Text style={styles.subtitle2}>Đvt</Text>
                            </View>

                            <View style={styles.tableCell_5}>
                                <Text style={styles.subtitle2}>Dung tích/nồng dộ</Text>
                            </View>

                            <View style={styles.tableCell_6}>
                                <Text style={styles.subtitle2}>Xuất xứ</Text>
                            </View>

                            <View style={styles.tableCell_7}>
                                <Text style={styles.subtitle2}>Đơn giá</Text>
                            </View>

                            <View style={styles.tableCell_8}>
                                <Text style={styles.subtitle2}>Hình ảnh</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.tableBody}>
                        {invoice?.map((row, index) => {
                            return [
                                <View style={[styles.tableRow, styles.backgroundColorRed]} key={index}>
                                    <View style={[styles.tableCell_1]} />
                                    <View style={[styles.tableCell_2]} />
                                    <View style={[styles.fontWeightBold, styles.tableCell_3, styles.overline]}>
                                        <Text>{row?.name}</Text>
                                    </View>
                                    <View style={[styles.tableCell_4, styles.tableCell_5, styles.tableCell_6, styles.tableCell_7, styles.tableCell_8]} />
                                </View>,
                                ...[row?.categories_by_goods && row?.categories_by_goods?.map((parentRow, index) => {
                                    stt += 1;
                                    return [
                                        <View style={[styles.tableRow]} key={index}>
                                            <View style={styles.tableCell_1}>
                                                <Text>{stt}</Text>
                                            </View>
                                            <View style={styles.tableCell_2}>
                                                <Text>{parentRow?.code || ''}</Text>
                                            </View>
                                            <View style={styles.tableCell_3}>
                                                <Text>{parentRow?.name || ''}</Text>
                                            </View>
                                            <View style={styles.tableCell_4}>
                                                <Text>{parentRow?.unit_of_measure?.name || ''}</Text>
                                            </View>
                                            <View style={styles.tableCell_5}>
                                                <Text>{parentRow?.volume || 0}ml-{parentRow?.alcohol_level || 0}%acl/vol</Text>
                                            </View>
                                            <View style={styles.tableCell_6}>
                                                <Text>{parentRow?.origin || ''}</Text>
                                            </View>
                                            <View style={styles.tableCell_7}>
                                                <Text>{currencyFormatter(parentRow?.price || 0)}</Text>
                                            </View>
                                            <View style={styles.tableCell_8}>
                                                <ImageExport filename={parentRow?.photo_export} folder={FOLDER_IMAGE.good}
                                                    sx={{ minWidth: '100%', height: 'auto' }}
                                                    alt="img"
                                                />
                                            </View>
                                        </View>
                                    ]
                                })],
                                ...[row?.children && row?.children?.map((childrenRow, index) => {
                                    return [
                                        childrenRow.categories_by_goods.length > 0 && (
                                            <View style={[styles.tableRow, styles.backgroundColorWhite]} key={index}>
                                                <View style={[styles.tableCell_1]} />
                                                <View style={[styles.tableCell_2]} />
                                                <View style={[styles.fontWeightBold, styles.tableCell_3, styles.overline]}>
                                                    <Text>{childrenRow?.name}</Text>
                                                </View>
                                                <View style={[styles.tableCell_4, styles.tableCell_5, styles.tableCell_6, styles.tableCell_7, styles.tableCell_8]} />
                                            </View>
                                        ),
                                        ...[childrenRow?.categories_by_goods && childrenRow?.categories_by_goods?.map((goodItem, index) => {
                                            stt += 1;
                                            return [
                                                <View style={[styles.tableRow]} key={index}>
                                                    <View style={styles.tableCell_1}>
                                                        <Text>{stt}</Text>
                                                    </View>
                                                    <View style={styles.tableCell_2}>
                                                        <Text>{goodItem?.code || ''}</Text>
                                                    </View>
                                                    <View style={styles.tableCell_3}>
                                                        <Text>{goodItem?.name || ''}</Text>
                                                    </View>
                                                    <View style={styles.tableCell_4}>
                                                        <Text>{goodItem?.unit_of_measure?.name || ''}</Text>
                                                    </View>
                                                    <View style={styles.tableCell_5}>
                                                        <Text>{goodItem?.volume || 0}ml-{goodItem?.alcohol_level || 0}%acl/vol</Text>
                                                    </View>
                                                    <View style={styles.tableCell_6}>
                                                        <Text>{goodItem?.origin || ''}</Text>
                                                    </View>
                                                    <View style={styles.tableCell_7}>
                                                        <Text>{currencyFormatter(goodItem?.price || 0)}</Text>
                                                    </View>
                                                    <View style={styles.tableCell_8}>
                                                        <ImageExport filename={goodItem?.photo_export} folder={FOLDER_IMAGE.good}
                                                            sx={{ minWidth: '100%', height: 'auto' }}
                                                            alt="img"
                                                        />
                                                    </View>
                                                </View>
                                            ]
                                        })]
                                    ]
                                })]
                            ]
                        })}
                    </View>
                </View>
            </Page>
        </Document>
    )
}