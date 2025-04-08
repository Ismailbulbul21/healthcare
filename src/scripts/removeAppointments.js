import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAYEBSFKxTtcBvbwxz7m5-xCCebb1nJ46o",
    authDomain: "healthcarechat-2ec94.firebaseapp.com",
    projectId: "healthcarechat-2ec94",
    storageBucket: "healthcarechat-2ec94.firebasestorage.app",
    messagingSenderId: "822228374621",
    appId: "1:822228374621:web:3b75c9bd880ff6cb9be9b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to remove all appointments
const removeAllAppointments = async () => {
    try {
        console.log('Connecting to Firestore...');

        // Get all appointments
        const appointmentsCollection = collection(db, 'appointments');
        const querySnapshot = await getDocs(appointmentsCollection);

        if (querySnapshot.empty) {
            console.log('No appointments found to delete.');
            return;
        }

        console.log(`Found ${querySnapshot.size} appointments to delete.`);

        // Delete each appointment
        let deletedCount = 0;
        for (const docSnapshot of querySnapshot.docs) {
            await deleteDoc(doc(db, 'appointments', docSnapshot.id));
            deletedCount++;
            console.log(`Deleted appointment ${deletedCount}/${querySnapshot.size}`);
        }

        console.log(`Successfully deleted ${deletedCount} appointments.`);
    } catch (error) {
        console.error('Error removing appointments:', error);
        throw error;
    }
};

// Run the removal
console.log('Starting appointment removal...');
removeAllAppointments()
    .then(() => {
        console.log('Appointment removal complete.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error during removal:', error);
        process.exit(1);
    }); 