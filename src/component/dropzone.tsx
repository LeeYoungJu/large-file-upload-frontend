import React, { useEffect, useState } from 'react';
import styled from 'styled-components/macro';
import axios from 'axios';

const CHUNK_SIZE = 50 * 1024;

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

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const fileArray = Array.from(e.dataTransfer.files);
        setFiles([...files, ...fileArray]);        
        
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
        console.log(e);
        
        if(curFileIdx !== null && curChunkIdx !== null) {
            const file = files[curFileIdx];
            const target = e.target as any
            const data = target.result;

            const params = new URLSearchParams();
            params.set('name', file.name);
            params.set('size', file.size.toString());
            params.set('curChunkIdx', `${curChunkIdx}`);
            params.set('totalChunks', `${Math.ceil(file.size / CHUNK_SIZE)}`)
            const headers = {'Content-Type': 'application/octet-stream'};
            const url = `http://localhost:8000/upload?${params.toString()}`;
            
            axios.post(url, data, {headers})
                .then(res => {                    
                    const fileSize = files[curFileIdx].size;
                    const isLastChunk = curChunkIdx === Math.ceil(fileSize / CHUNK_SIZE) - 1;
                    if(isLastChunk) {
                        file.finalFileName = res.data.finalFileName;                        
                        setLastUploadedFileIdx(curFileIdx);
                        setCurChunkIdx(null);
                        setDropzoneActive(false);
                    } else {
                        setCurChunkIdx(curChunkIdx + 1);
                    }
                });            
        }        
    };

    useEffect(() => {
        if(curFileIdx !== null) {
            if(lastUploadedFileIdx === null) {
                return;
            }
            const isLastFile = lastUploadedFileIdx === files.length - 1;
            const nextFileIdx = isLastFile ? null : curFileIdx + 1;
            setCurFileIdx(nextFileIdx);
        }
    }, [lastUploadedFileIdx]);

    useEffect(() => {
        if(files.length > 0) {
            if(curFileIdx === null) {
                setCurFileIdx(lastUploadedFileIdx === null ? 0 : lastUploadedFileIdx + 1);
            }
        }
        
    }, [files.length]);

    useEffect(() => {
        if(curFileIdx !== null) {
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
                        <a className='file' target="_blank"
                            href={`http://localhost:8000/uploads/${file.finalFileName}`}>
                            <div className='name'>{file.name}</div>
                            <ProgressDiv style={{
                                width: progress+'%'
                            }}>{progress}</ProgressDiv>
                        </a>
                    )
                })}
            </FileDiv>
        </div>
    );
};

export default DropZone;


interface DropZoneProps {
    isActive: boolean;
}

const DropZoneDiv = styled.div<DropZoneProps>`
    border: 2px dashed rgba(255,255,255,0.2);
    border-radius: 10px;
    padding: 50px 0;
    text-align: center;
    text-transform: uppercase;
    color: rgba(255,255,255,0.6);
    ${(props) => props.isActive ? 'border-color: #fff;' : ''}

`;

const FileDiv = styled.div`
    text-decoration: none;
    color: rgba(255,255,255,0.8);
    display: block;
    background-color: #41415d;
    border-radius: 10px;
    margin-top: 20px;
    padding: 10px;
    position: relative;
    overflow: hidden;
`;

const ProgressDiv = styled.div`
    background-color: rgba(80,80,120, 0.8);
    position: absolute;
    inset: 0;
`;