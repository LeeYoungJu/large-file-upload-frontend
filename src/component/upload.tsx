import React, { useEffect, useState } from 'react';
import apiService from 'util/axios';
import { DropZoneDiv, DropZoneLabel, FileDiv, ProgressDiv, FileNameDiv, UploadTimeDiv } from 'styles/dropzone';

interface Props {

}


const Upload = ({}: Props) => {
    const [dropzoneActive, setDropzoneActive] = useState<boolean>(false);
    
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const [progress, setProgress] = useState<number>(0);

    const [files, setFiles] = useState<Array<File>>([]);

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

    useEffect(() => {
        if(files.length > 0) {
            sendFile();
        }
        
    }, [files.length]);

    const sendFile = () => {    
        const now = new Date();
        setStartDate(now);

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        const url = 'uploadfiles/';

        const promise = apiService.postForm(url, formData, (e: ProgressEvent) => {
            const percentage = (e.loaded * 100) / e.total;
            setProgress(percentage);
        });
        if(!promise) {
            return;
        }
        promise.then(res => {
            console.log(res);
            const now = new Date();
            setEndDate(now);
            resetData();
        });    
    };

    const resetData = () => {
        setFiles([]);
        setProgress(0);
        setStartDate(null);
        setEndDate(null);
    };

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
                    <input multiple accept='image/*, .csv' type="file" onChange={handleSelectFiles} />
                </DropZoneLabel>

            </DropZoneDiv>    
            <FileDiv>
                {
                    progress && (
                        <ProgressDiv style={{
                            width: progress+'%'
                        }}>{progress}%</ProgressDiv>
                    )
                }                
            </FileDiv>
            {
                startDate && endDate && (
                    <UploadTimeDiv>
                        {Math.round((endDate.getTime() - startDate.getTime())/1000)}
                    </UploadTimeDiv>
                )
            }
        </div>
    )
};

export default Upload;