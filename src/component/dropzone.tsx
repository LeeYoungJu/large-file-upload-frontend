import React, { useEffect, useState } from 'react';
import apiService from 'util/axios';
import {v4 as uuidv4} from 'uuid';
import md5 from "md5";
import { DropZoneDiv, DropZoneLabel, FileDiv, ProgressDiv, FileNameDiv, UploadTimeDiv } from 'styles/dropzone';

const CHUNK_SIZE = 1048576 * 3; //3MB

interface Props {
    
}

interface UploadFile extends File {
    finalFileName?: string;
}

const DropZone = ({}: Props) => {
    const [dropzoneActive, setDropzoneActive] = useState<boolean>(false);
    const [files, setFiles] = useState<Array<UploadFile>>([]);

    const [curFileIdx, setCurFileIdx] = useState<number | null>(null);
    const [lastUploadedFileIdx, setLastUploadedFileIdx] = useState<number | null>(null);    

    const [curChunkIdx, setCurChunkIdx] = useState<number | null>(null);

    const [fileUuid, setFileUuid] = useState<string>('');
    const [isLastFile, setIsLastFile] = useState<boolean>(false);

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

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
        if(curFileIdx !== null && curChunkIdx !== null) {
            const file = files[curFileIdx];
            const target = e.target as any
            const data = target.result;
            const name = fileUuid+file.name;
            const md5Name = md5(name);

            const params = new URLSearchParams();
            params.set('name', name);
            params.set('md5Name', md5Name);
            params.set('size', file.size.toString());
            params.set('curChunkIdx', `${curChunkIdx}`);
            params.set('totalChunks', `${Math.ceil(file.size / CHUNK_SIZE)}`)
            const headers = {'Content-Type': 'application/octet-stream'};
            const url = `upload?${params.toString()}`;
            
            const promise = apiService.post(url, data, {headers});
            if(!promise) {
                return;
            }
            promise.then(res => {                    
                const fileSize = files[curFileIdx].size;
                const isLastChunk = curChunkIdx === Math.ceil(fileSize / CHUNK_SIZE) - 1;
                if(isLastChunk) {
                    file.finalFileName = res.data.finalFileName;                        
                    setLastUploadedFileIdx(curFileIdx);
                    setCurChunkIdx(null);
                    setDropzoneActive(false);

                    const now = new Date();
                    setEndDate(now);
                } else {
                    // setTimeout(() => {
                        setCurChunkIdx(curChunkIdx + 1);
                    // }, 50);
                }                
            });
            const now = new Date();
            setEndDate(now);
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

export default DropZone;