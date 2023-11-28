import { v4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/utils/firebase';


export const truncateText = (
    text: string,
    startChars: number,
    endChars: number,
    maxLength: number) => {
    if (text.length > maxLength) {
        const start = text.slice(0, startChars)
        const end = text.slice(text.length - endChars, text.length)
        return `${start}...${end}`
    }
    return text
}

export function daysRemaining(dateTimeString: string) {
    const now = new Date();
    const givenDate = new Date(dateTimeString);

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const diffInMilliseconds = Math.abs(now.getTime() - givenDate.getTime());

    const days = Math.floor(diffInMilliseconds / millisecondsPerDay)

    return days == 1 ? '1 day' : `${days} days`;
}

export const uploadImage = async (imageFile: File) => {
    const imageRef = ref(storage, `images/${imageFile.name + v4()}`);
    const snapshot = await uploadBytes(imageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;  
};