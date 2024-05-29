import { Grid, TextField } from "@mui/material"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { TimePicker } from "@mui/x-date-pickers/TimePicker"
import { DemoContainer } from "@mui/x-date-pickers/internals/demo"
import React, { useRef, useState } from "react"
import { Accordion, Button } from "react-bootstrap"
import { MicFill, PlayBtn, PauseBtn } from "react-bootstrap-icons"
import dayjs from 'dayjs'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import TableComponent from "./TableComponent"

const MessageInput = ({ selected, setSelected, patientMessageList, addMessage }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const mediaRecorderRef = useRef(null);
    const [audioUrl, setAudioUrl] = useState('');
    const audioChunks = useRef([]);
    const inputRef1 = useRef(null);
    const inputRef2 = useRef(null);
    const header = [
        {
            scoped: true,
            render: (data, index) => {
                return index + 1
            },
            label: '#'
        },
        {
            key: 'date',
            label: 'Date'
        },
        {
            key: 'time',
            label: 'Time'
        },
        {
            scoped: true,
            render: (data, index) => {
                return (<React.Fragment>
                    {(!isAudioPlaying[index]) && <PlayBtn size={40} onClick={() => playAudio((data?.mode === 'voice' ? arrayBufferToBlobUrl(data.data, data.contentType) : data?.text), index, data.mode)} />}
                    {isAudioPlaying[index] && <PauseBtn size={40} onClick={() => playAudio((data?.mode === 'voice' ? arrayBufferToBlobUrl(data.data, data.contentType) : data?.text), index, data.mode)} />}
                </React.Fragment>)
            },
            label: 'Media',
        }
    ]

    const [isAudioPlaying, setIsAudioPlaying] = useState([]);
    const onParentClikc = (ref) => {
        if (ref.current) {
            ref.current.checked = true;
            selected.mode = ref.current.value
            setSelected({ ...selected, mode: ref.current.value })
            console.log(selected)

        }
    };
    const onChange = (e, fieldName) => {
        if (e?.target?.name === 'text') {
            console.log(e.target.value)
            setSelected({ ...selected, text: e.target.value })
            return
        }
        if (fieldName === 'date') {
            let date = dayjs(e).format('YYYY-MM-DD')
            setSelected({ ...selected, date: date })
        } else {
            let time = dayjs(e).format('hh:mm A')
            setSelected({ ...selected, time: time })
        }
    };
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
    const playAudio = (audioUrl, index, mode) => {
        if (mode === 'voice') {
            const audio = new Audio(audioUrl);
            setIsAudioPlaying({ ...isAudioPlaying, [index]: true })
            audio.play();

            audio.onended = () => {
                setIsAudioPlaying({ ...isAudioPlaying, [index]: false })
            }

        } else {
            setIsAudioPlaying({ ...isAudioPlaying, [index]: true })
            handleSpeak(audioUrl)
            setIsAudioPlaying({ ...isAudioPlaying, [index]: false })
        }

    }

    const handleSpeak = (text) => {
        console.log(text)
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Sorry, your browser does not support text to speech!');
        }
    };
    const arrayBufferToBlobUrl = (base64data, contentType) => {
        let byteCharacters = atob(base64data)
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: contentType });
        return URL.createObjectURL(blob);
    };



    return (
        <>
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

            {selected?.mode &&

                <Grid container spacing={3}>
                    <Grid item xs={selected?.mode === 'text' ? 12 : 6} textAlign={"center"}>

                        <br />
                        {selected.mode === 'voice' && < MicFill className={isRecording ? 'mic_record mic_record_blink' : 'mic_record'} size='40' style={{ margin: '5px' }} onClick={isRecording ? stopRecording : startRecording} />}
                        {selected?.mode === 'text' && <TextField name="text" onChange={onChange} fullWidth label="Add your text hear" variant="outlined" />}
                    </Grid>
                    {((audioUrl && !isRecording) || selected?.mode === 'text') &&
                        <React.Fragment>
                            {selected?.mode === 'voice' &&
                                <Grid item xs={6}>
                                    <audio controls src={audioUrl} style={{ width: '100%', margin: '5px' }} />
                                </Grid>
                            }
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
                            <Grid item xs={12} alignItems={'flex-end'}>
                                {((audioBlob && !isRecording) || selected?.mode === 'text') && <Button style={{ float: 'right' }} onClick={() => addMessage(audioBlob)}>Upload Audio</Button>}
                            </Grid>
                        </React.Fragment>
                    }
                </Grid>
            }
            <hr />
            <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey="1">
                    <Accordion.Header>Saved Messages</Accordion.Header>
                    <Accordion.Body>
                        <TableComponent
                            headers={header}
                            dataList={patientMessageList}
                        />
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </>
    )
}
export default MessageInput