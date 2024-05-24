import Link from 'next/link'

export default function Page() {
    return (
        <div>
            <h1>You are Home.</h1>
            <Link href="/dashboard">Click here to navigate to Dashboard!</Link>
        </div>
    );
}