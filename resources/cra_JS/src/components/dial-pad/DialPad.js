import React, { useState, useEffect } from 'react';
import {
  Box
} from '@mui/material';
import MuiPhoneNumber from 'material-ui-phone-number';
import { useSnackbar } from '../snackbar';
import axios from '../../utils/axios';
import './style.css';

/* eslint-disable */
const stringClient = new StringeeClient();

console.log('Stringee Client ', stringClient);

const fromNumber = '842899988869';

export default function DialPad({ onCallFinish, currentContact }) {
  const { enqueueSnackbar } = useSnackbar();
  const [customerPhoneNumber, setCustomerPhoneNumber] = useState('84');
  const [token, setToken] = useState(null);

  useEffect(() => {
    getToken();
  }, []);

  useEffect(() => {
    if (token) {
      connectStringee();
      onConnected();
      onAuthencattion();
      setCustomerPhoneNumber(customerPhoneNumber.concat(currentContact.party.phone1));
    }
  }, [token]);

  const getNumberPhone = (number) => {
    console.log('number ', number);
    if (number === null) {
      return;
    }

    setCustomerPhoneNumber(customerPhoneNumber.concat('84', number));
  };

  const createContact = async (params) => {
    await axios.post('contacts', params);
  };

  const getCallLog = async (callId) => {
    console.log('callId ', callId);
    const callLog = await axios.get('call-log', {
      params: {
        call_id: callId,
      },
    });

    onCallFinish(currentContact.party.id);
    console.log('call ', callLog);
  };

  const currentCall = new StringeeCall(stringClient, fromNumber, customerPhoneNumber, false);

  const makeCall = () => {
    const remoteVideo = document.getElementById('remoteVideo');
    const localVideo = document.getElementById('localVideo');

    settingCallEvent(currentCall, localVideo, remoteVideo);

    currentCall.makeCall((response) => {
      console.log('res call', response);
      if (response.message === 'SUCCESS') {
        createContact({
          order_id: currentContact?.id || null,
          customer_id: currentContact.party.id,
          call_id: response.callId,
          customer_phone_number: response.toNumber,
        });

        console.log('response.callId', response.callId);
      } else if (response.message === 'NOT_ENOUGH_MONEY') {
        enqueueSnackbar('NOT_ENOUGH_MONEY', { variant: 'error' });
      }
    });

    currentCall.answer(function (res) {
      console.log('answer res', res);
    });
  };

  stringClient.on('incomingcall', function (incomingcall) {
    console.log('incomingcall', incomingcall);
  });

  stringClient.on('disconnect', function (resp) {
    console.log('resp', resp);
  });

  stringClient.on('otherdeviceauthen', function (data) {
    console.log('otherdeviceauthen: ', data);
  });

  const onAuthencattion = () => {
    stringClient.on('authen', function (res) {
      console.log('on authen: ', res);
    });
  };

  const connectStringee = () => {
    stringClient.connect(token);
  };

  const onConnected = () => {
    stringClient.on('connect', function () {
      console.log('conected');
    });
  };

  const settingCallEvent = function (currentCall, localVideo, remoteVideo) {
    currentCall.on('addremotestream', function (stream) {
      // reset srcObject to work around minor bugs in Chrome and Edge.
      console.log('addremotestream', stream);
      remoteVideo.srcObject = null;
      remoteVideo.srcObject = stream;
    });

    currentCall.on('addlocalstream', function (stream) {
      // reset srcObject to work around minor bugs in Chrome and Edge.
      console.log('addlocalstream');
      localVideo.srcObject = null;
      localVideo.srcObject = stream;
    });

    currentCall.on('signalingstate', function (state) {
      console.log('signalingstate ', state);
      if (state.code === 6 || state.code === 5) {
        try {
          getCallLog(currentCall.callId);
          stringClient.disconnect();
        } catch (error) {
          console.log('error ', error);
        }
      }
    });

    currentCall.on('mediastate', function (state) {
      console.log('mediastate ', state);
    });

    currentCall.on('info', function (info) {
      console.log('on info:' + JSON.stringify(info));
    });
  };

  const getToken = async () => {
    const response = await axios.get('token');
    if (response.data.data) {
      console.log('response.data.data', response.data.data);
      setToken(response.data.access_token);
    }
  };

  const muteCall = () => {
    if (currentCall.muted) {
      currentCall.mute(false);
      console.log('unmuted');
    } else {
      currentCall.mute(true);
      console.log('muted');
    }
  };

  const cancelCall = () => {
    console.log('currentCall', currentCall);
    if (currentCall != null) {
      currentCall.hangup(function (res) {
        console.log('+++ hangup: ', res);
      });
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', py: 2, px: 2.5 }}>
        <MuiPhoneNumber
          fullWidth
          size="small"
          variant="outlined"
          onlyCountries={['vn']}
          defaultCountry={'vn'}
          defaultValue={customerPhoneNumber}
          value={customerPhoneNumber}
          onChange={(value) => {
            setCustomerPhoneNumber(value);
          }}
        />
      </Box>
      <div className="pad">
        <div id="video-container" style={{ display: 'none' }}>
          <video id="localVideo" autoPlay muted></video>
          <video id="remoteVideo" autoPlay></video>
        </div>
        <div className="dial-pad">
          <div className="digits">
            <div
              onClick={(e) => {
                const itemNumber = e.target.getAttribute('data-item');
                getNumberPhone(itemNumber);
              }}
              className="dig number-dig"
              name="1"
              style={{ padding: '8px' }}
              data-item="1"
            >
              1
              <div className="sub-dig" style={{ display: 'none' }}>
                ABC
              </div>
            </div>
            <div
              onClick={(e) => {
                const itemNumber = e.target.getAttribute('data-item');
                getNumberPhone(itemNumber);
              }}
              className="dig number-dig"
              name="2"
              data-item="2"
            >
              2<div className="sub-dig">ABC</div>
            </div>
            <div
              onClick={(e) => {
                const itemNumber = e.target.getAttribute('data-item');
                getNumberPhone(itemNumber);
              }}
              className="dig number-dig"
              name="3"
              data-item="3"
            >
              3<div className="sub-dig">DEF</div>
            </div>
            <div
              onClick={(e) => {
                const itemNumber = e.target.getAttribute('data-item');
                getNumberPhone(itemNumber);
              }}
              className="dig number-dig"
              name="4"
              data-item="4"
            >
              4<div className="sub-dig">GHI</div>
            </div>
            <div
              onClick={(e) => {
                const itemNumber = e.target.getAttribute('data-item');
                getNumberPhone(itemNumber);
              }}
              className="dig number-dig"
              name="5"
              data-item="5"
            >
              5<div className="sub-dig">JKL</div>
            </div>
            <div
              onClick={(e) => {
                const itemNumber = e.target.getAttribute('data-item');
                getNumberPhone(itemNumber);
              }}
              className="dig number-dig"
              name="6"
              data-item="6"
            >
              6<div className="sub-dig">MNO</div>
            </div>
            <div
              onClick={(e) => {
                const itemNumber = e.target.getAttribute('data-item');
                getNumberPhone(itemNumber);
              }}
              className="dig number-dig"
              name="7"
              data-item="7"
            >
              7<div className="sub-dig">PQRS</div>
            </div>
            <div
              onClick={(e) => {
                const itemNumber = e.target.getAttribute('data-item');
                getNumberPhone(itemNumber);
              }}
              className="dig number-dig"
              name="8"
              data-item="8"
            >
              8<div className="sub-dig">TUV</div>
            </div>
            <div
              onClick={(e) => {
                const itemNumber = e.target.getAttribute('data-item');
                getNumberPhone(itemNumber);
              }}
              className="dig number-dig"
              name="9"
              data-item="9"
            >
              9<div className="sub-dig">WXYZ</div>
            </div>
            <div className="dig number-dig astrisk" name="*">
              *
            </div>
            <div
              onClick={(e) => {
                const itemNumber = e.target.getAttribute('data-item');
                getNumberPhone(itemNumber);
              }}
              className="dig number-dig pound"
              name="0"
              data-item="0"
            >
              0
            </div>
            <div className="dig number-dig pound" name="#">
              #
            </div>
          </div>
          <div className="digits">
            <div
              className="dig addPerson action-dig"
              onClick={() => {
                muteCall();
              }}
            ></div>
            <div className="dig-spacer"></div>
            <div
              className="dig goBack action-dig"
              onClick={() => {
                cancelCall();
              }}
            ></div>
            <div className="dig-spacer"></div>
            <div className="call-icon"></div>
            <div
              onClick={() => {
                makeCall();
              }}
              className="call action-dig"
            >
              <div className="call-change">
                <span></span>
              </div>
              <div className="call-icon"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
