import DropZone from 'component/dropzone';
import DropZoneSocket from 'component/dropzoneSocket';
import Upload from 'component/upload';

interface Props {

}

const uploadPage = ({}: Props) => {
    

    return (
        <div>
            <Upload></Upload>
            <DropZone></DropZone>
            {/* <DropZoneSocket></DropZoneSocket> */}
        </div>
    )
};

export default uploadPage;