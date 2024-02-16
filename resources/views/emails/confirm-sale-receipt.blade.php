<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Confirm Sale Receipt</title>
</head>
<body>
<table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" style="background:#f8f9fa;border-collapse:collapse;height:100%!important;margin:0;padding:0;width:100%!important" bgcolor="#f8f9fa">
    <tbody>
    <tr>
        <td align="center" valign="top" style="border-top-width:0;height:100%!important;margin:0;padding:20px 10px;width:100%!important">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;border:0;max-width:600px">
                <tbody>
                <tr>
                    <td align="center" valign="top" style="text-align:center;background:#f8f9fa;border-bottom-color:#2ec866;border-bottom-style:solid;border-bottom-width:10px;border-top-width:0" bgcolor="#f8f9fa">
                    </td>
                </tr>
                <tr>
                    <td align="center" valign="top" style="background:#ffffff;border-bottom-width:0;border-top-width:0" bgcolor="#ffffff">
                        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse">
                            <tbody>
                            <tr style="border-bottom:1px solid #eff1f3;border-left:1px solid #eff1f3;border-right:1px solid #eff1f3">
                                <td valign="top" style="padding-top:30px;padding-bottom:30px;padding-left:20px;padding-right:20px">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;min-width:100%">
                                        <tbody>
                                        <tr>
                                            <td valign="top">
                                                <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;min-width:100%">
                                                    <tbody>
                                                    <tr>
                                                        <td valign="top" style="color:#606060;font-family:Verdana,Geneva,sans-serif;font-size:15px;line-height:125%;padding:9px 18px 0px 18px;text-align:left" align="left">
                                                            <span style="font-family:arial,helvetica neue,helvetica,sans-serif">
                                                            Chào bạn,
                                                            <br><br>
                                                            Bạn có yêu cầu duyệt đơn hàng sau:
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;min-width:100%">
                                        <tbody>
                                        <tr>
                                            <td valign="top">
                                                <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;min-width:100%">
                                                    <tbody>
                                                    <tr>
                                                        <td valign="top" style="color:#606060;font-family:Verdana,Geneva,sans-serif;font-size:15px;line-height:125%;padding:9px 18px 5px;text-align:left" align="left">
                                                            <table width="100%" style="min-width:100%;width:100%">
                                                                <tbody>
                                                                <tr>
                                                                    <td style="border:1px solid #c2c7d0;padding:12px;border-radius:4px">
                                                                        <h2 style="color:#2ec866;display:block;font-family:arial,helvetica neue,helvetica,sans-serif;font-weight:bold;font-size:18px;font-weight:normal;letter-spacing:normal;line-height:125%;margin:0;padding:0 0 4px;text-align:left" align="left">
                                                                            <b>Đơn hàng {{ $code }}</b>
                                                                        </h2>
                                                                        <h3 style="color:#979faf;display:block;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;font-size:14px;font-style:normal;font-weight:normal;letter-spacing:normal;line-height:125%;margin:0 0 10px 0;padding:0;text-align:left" align="left">
                                                                            {{ $date }}
                                                                        </h3>
                                                                        <span style="color:#606060;font-family:Verdana,Geneva,sans-serif;font-size:15px;line-height:125%;text-align:left">
                                                                        Khách hàng: {{ $party }}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;min-width:100%">
                                        <tbody>
                                        <tr>
                                            <td style="padding:18px" valign="top" align="center">
                                                <table border="0" cellpadding="0" cellspacing="0" style="background:#2ec866;border-collapse:separate!important;border-radius:3px" bgcolor="#2EC866">
                                                    <tbody>
                                                    <tr>
                                                        <td align="center" valign="middle" style="font-family:Arial;font-size:16px;padding:15px;color:#fff">
                                                            <a title="Solve the-grid-search!" href="{{ $url }}" style="color:#ffffff;display:block;font-weight:bold;letter-spacing:normal;line-height:100%;text-align:center;text-decoration:none;word-wrap:break-word" target="_blank" data-saferedirecturl="">Duyệt Đơn</a>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;min-width:100%">
                                        <tbody>
                                        <tr>
                                            <td valign="top">
                                                <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;min-width:100%">
                                                    <tbody>
                                                    <tr>
                                                        <td valign="top" style="color:#606060;font-family:Verdana,Geneva,sans-serif;font-size:15px;line-height:125%;padding:9px 18px;text-align:left" align="left">
                                                            <span style="font-family:arial,helvetica neue,helvetica,sans-serif">
                                                            Cảm ơn,<br>
                                                            Chúc bạn một ngày tốt lành</span>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td align="center" valign="top" id="m_9039739695413027046templateLowerBody" style="background:#eff1f3;border-bottom-width:0;border-top-width:0" bgcolor="#eff1f3">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse">
                            <tbody>
                            <tr>
                                <td valign="top"></td>
                            </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                </tbody>
            </table>
        </td>
    </tr>
    </tbody>
</table>

</body>
</html>
