export class LocalBiometricAuth {
    static lastAuth: Date | null

    static async isAvailable(): Promise<boolean> {
        return !!window.PublicKeyCredential && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }

    static isRegistered(): boolean {
        return localStorage.getItem('localCredentialId') !== null;
    }

    static isEnabled(): boolean {
        const is = localStorage.getItem('biometricAuth')
        return Boolean(is) && is === 'true';
    }

    static setBiometric(status: boolean) {
        return localStorage.setItem('biometricAuth', status.toString())
    }

    static async isNeedToAuth() {
        if (!await this.isAvailable()) return false
        if (this.lastAuth === null) return false

        if (this.lastAuth) {
            const now = new Date()
            const elapsed = now.getTime() - this.lastAuth.getTime()

            return elapsed > 1 * 60 * 1000;
        }

        return false
    }

    static async register(): Promise<boolean> {
        const challenge = crypto.getRandomValues(new Uint8Array(32));

        const credential = await navigator.credentials.create({
            publicKey: {
                challenge,
                rp: { name: 'Expense' },
                user: {
                    id: Uint8Array.from('expense-user', c => c.charCodeAt(0)),
                    name: 'expense-user',
                    displayName: 'Expense User',
                },
                pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
                timeout: 60000,
                authenticatorSelection: {
                    authenticatorAttachment: 'platform',
                    userVerification: 'required',
                },
                attestation: 'none'
            }
        });

        if (credential) {
            const rawId = (credential as PublicKeyCredential).rawId;
            const b64Id = btoa(String.fromCharCode(...new Uint8Array(rawId)));
            localStorage.setItem('localCredentialId', b64Id);
            return true
        }

        throw new Error('Fail.')
    }

    static unregister(): void {
        localStorage.removeItem('localCredentialId');
    }

    static async authenticate(): Promise<boolean> {
        const b64Id = localStorage.getItem('localCredentialId');
        if (!b64Id) {
            throw new Error('No credential registered.');
        }

        const credentialId = Uint8Array.from(atob(b64Id), c => c.charCodeAt(0)).buffer;
        const challenge = crypto.getRandomValues(new Uint8Array(32));

        const credential = await navigator.credentials.get({
            publicKey: {
                challenge,
                allowCredentials: [{
                    id: credentialId,
                    type: 'public-key',
                    transports: ['internal']
                }],
                timeout: 60000,
                userVerification: 'required'
            }
        });

        if (credential) {
            return true;
        }

        throw new Error('Biometric auth failed');
    }
}