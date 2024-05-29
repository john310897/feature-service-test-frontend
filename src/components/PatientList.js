import { useEffect, useState } from 'react';
import AppService from '../services/AppService';
import { Button, Modal } from 'react-bootstrap';
import React from 'react';
import MessageInput from './MessageInput';
import TableComponent from './TableComponent';
export const PatientList = () => {
    const [patientList, setPatientList] = useState([]);
    const [modalShow, setModalShow] = useState(false);
    const [selected, setSelected] = useState({});
    const [patientMessageList, setPatientMessageList] = useState([]);
    const header = [
        {
            scoped: true,
            render: (data, index) => {
                return index + 1
            },
            label: '#'
        },
        {
            key: 'firstName',
            label: 'First Name'
        },
        {
            key: 'lastName',
            label: 'Last Name'
        },
        {
            key: 'age',
            label: 'Age'
        },
        {
            scoped: true,
            render: (data, index) => <Button size='sm' onClick={() => openModal(data)}>Add Message</Button>
        }
    ]

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
        setSelected({})
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


    const saveMessage = async (audioBlob) => {
        const formData = new FormData();
        if (selected?.mode === 'voice')
            formData.append('audio', audioBlob, 'recording.wav');
        formData.append('date', selected.date);
        formData.append('time', selected.time);
        formData.append('patientId', selected.patient._id);
        formData.append('mode', selected?.mode)
        formData.append('text', selected?.text)

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
                    <MessageInput
                        addMessage={saveMessage}
                        selected={selected}
                        setSelected={setSelected}
                        patientMessageList={patientMessageList}
                    />
                </Modal.Body>
            </Modal >
        );
    };

    return (
        <>
            {dilogMOdal()}
            <TableComponent
                headers={header}
                dataList={patientList}
            />
        </>

    )
}
export default PatientList