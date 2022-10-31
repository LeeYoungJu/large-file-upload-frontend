import React, { useEffect, useRef, useState } from 'react';
import { DropZoneDiv, DropZoneLabel, FileDiv, ProgressDiv, FileNameDiv, UploadTimeDiv } from 'styles/dropzone';
import { sio } from 'util/socketio';
// import {io, Socket} from 'socket.io-client';
import {v4 as uuidv4} from 'uuid';
import md5 from "md5";

const CHUNK_SIZE = 1048576 * 3; //3MB
// const CHUNK_SIZE = 100000 * 5;

interface Props {
    
}

interface UploadFile extends File {
    finalFileName?: string;
}

const DropZoneSocket = ({}: Props) => {    
    const [dropzoneActive, setDropzoneActive] = useState<boolean>(false);
    const [files, setFiles] = useState<Array<UploadFile>>([]);

    const [curFileIdx, setCurFileIdx] = useState<number | null>(null);
    const [lastUploadedFileIdx, setLastUploadedFileIdx] = useState<number | null>(null);    

    const [curChunkIdx, setCurChunkIdx] = useState<number | null>(null);

    const [fileUuid, setFileUuid] = useState<string>('');
    const [isLastFile, setIsLastFile] = useState<boolean>(false);

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    useEffect(() => {        

        sio.on("connect", () => {
            console.log("connect!");            
        });

        return () => {
            sio.off("connect");
        }
        
    }, []);

    useEffect(() => {
        if(!sio) {
            return;
        }

        sio.on("uploadComplete", (arg) => {
            console.log(arg);
            
            if(curFileIdx === null || curChunkIdx === null) {
                return;
            }

            const fileSize = files[curFileIdx].size;
            const isLastChunk = curChunkIdx === Math.ceil(fileSize / CHUNK_SIZE) - 1;            
            if(isLastChunk) {
                // file.finalFileName = res.data.finalFileName;                        
                setLastUploadedFileIdx(curFileIdx);
                setCurChunkIdx(null);
                setDropzoneActive(false);
            } else {                
                setCurChunkIdx(curChunkIdx + 1);                
            }
            const now = new Date();
            setEndDate(now);
            
        });

        return () => {
            if(sio) {
                sio.off("uploadComplete");
            }
        }
    }, [curFileIdx, curChunkIdx]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const fileArray = Array.from(e.dataTransfer.files);
        setFiles([...files, ...fileArray]);
        
    };

    const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.currentTarget.files) {
            const fileArray = Array.from(e.currentTarget.files);
            setFiles([...files, ...fileArray]);
        }        
    };

    const readAndUploadCurChunk = () => {
        if(curFileIdx !== null && curChunkIdx != null) {
            const reader = new FileReader();
            const file = files[curFileIdx];
            if(!file) {
                return;
            }
            const from = curChunkIdx * CHUNK_SIZE;
            const to = from + CHUNK_SIZE;
            const blob = file.slice(from, to);
            reader.onload = (e) => uploadChunk(e);
            reader.readAsDataURL(blob);
        }
    };

    const uploadChunk = (e: ProgressEvent) => {
        
        if(curFileIdx !== null && curChunkIdx !== null && sio) {
            const file = files[curFileIdx];
            const target = e.target as any
            const data = target.result;
            const name = fileUuid+file.name;
            const md5Name = md5(name);

            const params = {
                name,
                md5Name,
                size: file.size,
                curChunkIdx,
                totalChunks: Math.ceil(file.size / CHUNK_SIZE),
                data
            };

            sio.emit('upload', params);
        }        
    };

    useEffect(() => {
        if(curFileIdx !== null) {
            if(lastUploadedFileIdx === null) {
                return;
            }
            const isLastFileLocal = lastUploadedFileIdx === files.length - 1
            const nextFileIdx = isLastFileLocal ? null : curFileIdx + 1;
            setCurFileIdx(nextFileIdx);
            
            setIsLastFile(isLastFileLocal);
        }
    }, [lastUploadedFileIdx]);

    useEffect(() => {
        if(isLastFile) {
            setFiles([]);
            setCurFileIdx(null);
            setIsLastFile(false);
            setLastUploadedFileIdx(null);
        }
    }, [isLastFile])

    useEffect(() => {
        if(files.length > 0) {
            if(curFileIdx === null) {
                setFileUuid(uuidv4());
                setCurFileIdx(lastUploadedFileIdx === null ? 0 : lastUploadedFileIdx + 1);
            }
        }
        
    }, [files.length]);

    useEffect(() => {
        if(curFileIdx !== null) {
            const now = new Date();
            setStartDate(now);
            setCurChunkIdx(0);
        }        
    }, [curFileIdx]);

    useEffect(() => {
        if(curChunkIdx !== null) {
            readAndUploadCurChunk();
        }
    }, [curChunkIdx]);

    return (
        <div>
            <DropZoneDiv
                onDragOver={(e: React.DragEvent) => {
                    setDropzoneActive(true);
                    e.preventDefault();
                }}
                onDragLeave={(e: React.DragEvent) => {
                    setDropzoneActive(false);
                    e.preventDefault();
                }}
                onDrop={(e: React.DragEvent) => handleDrop(e)}
                isActive={dropzoneActive}
            >
                <DropZoneLabel>
                    <input type="file" multiple onChange={handleSelectFiles} />
                </DropZoneLabel>

            </DropZoneDiv>    
            <FileDiv>
                {files.map((file, fileIdx: number) => {
                    let progress = 0;
                    if(file.finalFileName) {
                        progress = 100;
                    } else {
                        const uploading = fileIdx === curFileIdx;
                        const chunks = Math.ceil(file.size / CHUNK_SIZE);
                        if(uploading) {                            
                            progress = curChunkIdx !== null ? Math.ceil(curChunkIdx / chunks * 100) : 0;
                        } else {
                            progress = 0;
                        }
                    }
                    return (
                        <a key={file.name} className='file' target="_blank"
                            href={`http://localhost:8000/uploads/${file.finalFileName}`}>
                            <FileNameDiv className='name'>{file.name}</FileNameDiv>
                            <ProgressDiv style={{
                                width: progress+'%'
                            }}>{progress}%</ProgressDiv>
                        </a>
                    )
                })}
            </FileDiv>
            {
                startDate && endDate && (
                    <UploadTimeDiv>
                        {Math.round((endDate.getTime() - startDate.getTime())/1000)}
                    </UploadTimeDiv>
                )
            }
        </div>
    );
};

export default DropZoneSocket;


