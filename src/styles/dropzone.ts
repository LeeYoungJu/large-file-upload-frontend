import styled from 'styled-components/macro';


interface DropZoneProps {
    isActive: boolean;
}

export const DropZoneDiv = styled.div<DropZoneProps>`
    border: 2px dashed rgba(255,255,255,0.2);
    border-radius: 10px;
    height: 100px;
    text-align: center;
    text-transform: uppercase;
    color: rgba(255,255,255,0.6);
    ${(props) => props.isActive ? 'border-color: #fff;' : ''}
`;

export const DropZoneLabel = styled.label`
    display: block;
    width: 100%;
    height: 100%;
    cursor: pointer;
    input[type="file"] {
        display: none;
    }
`;

export const FileDiv = styled.div`
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

export const ProgressDiv = styled.div`
    background-color: white;
    color: black;
    padding-left: 10px;
    position: absolute;
    inset: 0;
    z-index:9;
`;

export const FileNameDiv = styled.div`
    position: absolute;
    color: black;
    z-index:999;
    top: 0;
    left: 50px;
`;

export const UploadTimeDiv = styled.div`
    color: white;
    font-size: 16px;
    padding: 10px;
`;