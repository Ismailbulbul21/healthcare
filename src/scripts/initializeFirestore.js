import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

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

// Sample doctor data
const sampleDoctors = [
    {
        name: 'Dr. Sarah Johnson',
        specialty: 'Cardiologist',
        experience: 15,
        education: 'MD, Harvard Medical School',
        languages: ['English', 'Spanish'],
        rating: 4.8,
        totalReviews: 127,
        availability: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true
        }
    },
    {
        name: 'Dr. Michael Chen',
        specialty: 'Neurologist',
        experience: 12,
        education: 'MD, Johns Hopkins University',
        languages: ['English', 'Mandarin'],
        rating: 4.9,
        totalReviews: 98,
        availability: {
            monday: true,
            tuesday: true,
            wednesday: false,
            thursday: true,
            friday: true
        }
    },
    {
        name: 'Dr. Emily Rodriguez',
        specialty: 'Pediatrician',
        experience: 8,
        education: 'MD, Stanford University',
        languages: ['English', 'Spanish', 'French'],
        rating: 4.7,
        totalReviews: 156,
        availability: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: false
        }
    }
];

// Initialize doctors collection
const initializeDoctors = async () => {
    try {
        console.log('Connecting to Firestore...');
        // Check if doctors collection is empty
        const doctorsCollection = collection(db, 'doctors');
        const querySnapshot = await getDocs(doctorsCollection);

        if (querySnapshot.empty) {
            console.log('Initializing doctors collection with sample data...');

            // Add sample doctors
            for (const doctor of sampleDoctors) {
                await addDoc(doctorsCollection, {
                    ...doctor,
                    createdAt: new Date()
                });
                console.log(`Added doctor: ${doctor.name}`);
            }

            console.log('Doctors collection initialized successfully!');
        } else {
            console.log('Doctors collection already contains data.');
        }
    } catch (error) {
        console.error('Error initializing doctors collection:', error);
        throw error;
    }
};

// Run the initialization
console.log('Starting Firestore initialization...');
initializeDoctors()
    .then(() => {
        console.log('Firestore initialization complete.');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Error during initialization:', error);
        process.exit(1);
    }); 