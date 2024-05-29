import { useEffect, useRef, useState } from 'react';
import Table from 'react-bootstrap/Table';
import AppService from '../services/AppService';
import { Button, Modal } from 'react-bootstrap'
import { MicFill } from 'react-bootstrap-icons';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import { Grid } from '@mui/material';
import React from 'react';
import Accordion from 'react-bootstrap/Accordion';

export const PatientList = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const [audioUrl, setAudioUrl] = useState('');
    const [patientList, setPatientList] = useState([]);
    const audioChunks = useRef([]);
    const [modalShow, setModalShow] = useState(false);
    const inputRef1 = useRef(null);
    const inputRef2 = useRef(null);
    const [selected, setSelected] = useState({});
    const [patientMessageList, setPatientMessageList] = useState([]);

    useEffect(() => {
        getPatients()
    }, [])
    const openModal = (patient) => {
        setSelected({ ...selected, patient: patient })
        getMessagesByPatientId(patient._id)
        setModalShow(true);
    };
    const closeModal = () => {
        setModalShow(false);
    };
    const onParentClikc = (ref) => {
        if (ref.current) {
            ref.current.checked = true;
            setSelected({ ...selected, mode: ref.current.value })
        }
    };
    const onChange = (e, fieldName) => {
        if (fieldName === 'date') {
            let date = dayjs(e).format('YYYY-MM-DD')
            setSelected({ ...selected, date: date })
        } else {
            let time = dayjs(e).format('hh:mm A')
            setSelected({ ...selected, time: time })
        }
    };



    const getPatients = () => {
        AppService.getPatientList().then(resp => {
            setPatientList(resp?.data)
        })
    }
    const getMessagesByPatientId = (patientId) => {
        AppService.getPatientMessageList(patientId).then(resp => {
            setPatientMessageList(resp?.data)
        })
    }

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);

        mediaRecorderRef.current.ondataavailable = event => {
            audioChunks.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
            setAudioBlob(audioBlob);
            const audioUrl = URL.createObjectURL(audioBlob);
            setAudioUrl(audioUrl);
            audioChunks.current = [];
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
    };
    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    };
    const saveMessage = async () => {
        if (!audioBlob) return;

        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        // Add date and time to the form data
        const now = new Date();
        formData.append('date', selected.date);
        formData.append('time', selected.time);
        formData.append('patientId', selected.patient._id);

        try {
            AppService.uploadMessage(formData).then(res => {
                setPatientMessageList(res?.data)
            })
        } catch (error) {
            console.error('Error uploading audio:', error);
        }
    }
    const dilogMOdal = () => {
        return (
            <Modal show={modalShow} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Message</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="input_container">
                        <div
                            className="input_container_group"
                            onClickCapture={() => onParentClikc(inputRef1)}
                        >
                            <input
                                className="radio_input"
                                ref={inputRef1}
                                type="radio"
                                name="mode"
                                value="voice"
                            />
                            Voice
                        </div>
                        <div
                            className="input_container_group"
                            onClickCapture={() => onParentClikc(inputRef2)}
                        >
                            <input
                                type="radio"
                                ref={inputRef2}
                                className="radio_input"
                                name="mode"
                                value='text'
                            />
                            Text
                        </div>
                    </div>
                    {selected?.mode === 'voice' &&

                        <Grid container spacing={2}>
                            <Grid item xs={6} textAlign={"center"}>
                                <MicFill size='40' style={{ margin: '5px' }} onClick={isRecording ? stopRecording : startRecording} />
                            </Grid>
                            {(audioUrl && !isRecording) &&
                                <React.Fragment>
                                    <Grid item xs={6}>
                                        <audio style={{ width: '100%' }} controls src={audioUrl}></audio>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DemoContainer components={['DatePicker']}>
                                                <DatePicker name='date' onChange={(e) => onChange(e, 'date')} fullWidth label="Basic date picker" />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DemoContainer components={['TimePicker']}>
                                                <TimePicker name='time' onChange={(e) => onChange(e, 'time')} label="Basic time picker" />
                                            </DemoContainer>
                                        </LocalizationProvider>
                                    </Grid>
                                    <Grid item >
                                        {(audioBlob && !isRecording) && <Button style={{ float: 'right' }} onClick={saveMessage}>Upload Audio</Button>}
                                    </Grid>
                                </React.Fragment>
                            }
                        </Grid>


                    }

                    <Accordion defaultActiveKey="0">
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Saved Messages</Accordion.Header>
                            <Accordion.Body>
                                <Table striped bordered hover>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {patientMessageList?.map((message, index) => (
                                            <tr>
                                                <td>{index + 1}</td>
                                                <td>{message?.date}</td>
                                                <td>{message?.time}</td>
                                                <td></td>
                                            </tr>

                                        ))}

                                    </tbody>
                                </Table>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Modal.Body>
            </Modal >
        );
    };


    return (
        <>
            {dilogMOdal()}
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>age</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {patientList?.map((patient, index) => (
                        <tr>
                            <td>{index + 1}</td>
                            <td>{patient?.firstName}</td>
                            <td>{patient?.lastName}</td>
                            <td>{patient?.age}</td>
                            <td>
                                <Button size='sm' onClick={() => openModal(patient)}>Add Message</Button>
                            </td>
                        </tr>

                    ))}

                </tbody>
            </Table>
        </>

    )
}
export default PatientList