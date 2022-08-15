import DropZone from 'component/dropzone';
import DropZoneSocket from 'component/dropzoneSocket';

interface Props {

}

const uploadPage = ({}: Props) => {
    

    return (
        <div>
            <DropZone></DropZone>
            <DropZoneSocket></DropZoneSocket>
        </div>
    )
};

export default uploadPage;