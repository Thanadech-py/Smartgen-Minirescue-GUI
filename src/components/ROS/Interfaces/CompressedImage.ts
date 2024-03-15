import { Message } from 'roslib';
export interface CompressedImageMessage extends Message {
    format: string;
    data: string;
}

