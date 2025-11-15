import React, { useState } from 'react';
import { Key } from '../types';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { EyeIcon, EyeSlashIcon } from './Icons';

interface KeyModalProps {
  keyData?: Key;
  onSubmit: (key: Omit<Key, 'id'>) => void;
  onCancel: () => void;
}

const KeyModal: React.FC<KeyModalProps> = ({
  keyData,
  onSubmit,
  onCancel,
}) => {
  const [nameUrl, setNameUrl] = useState(keyData?.nameUrl || '');
  const [usernameEmail, setUsernameEmail] = useState(keyData?.usernameEmail || '');
  const [passwordKey, setPasswordKey] = useState(keyData?.passwordKey || '');
  const [showPasswordKey, setShowPasswordKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // At least one field should be filled
    if (!nameUrl && !usernameEmail && !passwordKey) {
      return;
    }
    onSubmit({
      nameUrl: nameUrl.trim() || undefined,
      usernameEmail: usernameEmail.trim() || undefined,
      passwordKey: passwordKey.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="keyNameUrl" className="block text-sm font-medium text-foreground mb-2">
          Name / Url <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <input
          type="text"
          id="keyNameUrl"
          value={nameUrl}
          onChange={(e) => setNameUrl(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-foreground"
          placeholder="e.g., GitHub or https://github.com"
        />
      </div>
      <div>
        <Label htmlFor="keyUsernameEmail" className="block text-sm font-medium text-foreground mb-2">
          Username / Email
        </Label>
        <input
          type="text"
          id="keyUsernameEmail"
          value={usernameEmail}
          onChange={(e) => setUsernameEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-foreground"
          placeholder="Username or Email"
        />
      </div>
      <div>
        <Label htmlFor="keyPasswordKey" className="block text-sm font-medium text-foreground mb-2">
          Password / Key
        </Label>
        <div className="relative">
          <input
            type={showPasswordKey ? 'text' : 'password'}
            id="keyPasswordKey"
            value={passwordKey}
            onChange={(e) => setPasswordKey(e.target.value)}
            className="mt-1 block w-full px-3 py-2 pr-10 bg-card border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-foreground font-mono"
            placeholder="Password or API Key"
          />
          <button
            type="button"
            onClick={() => setShowPasswordKey(!showPasswordKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-foreground/60 hover:text-foreground transition-colors"
            title={showPasswordKey ? 'Hide' : 'Show'}
          >
            {showPasswordKey ? (
              <EyeSlashIcon className="w-4 h-4" />
            ) : (
              <EyeIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      <div className="flex justify-end space-x-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!nameUrl && !usernameEmail && !passwordKey}
        >
          {keyData ? 'Save Changes' : 'Add Key'}
        </Button>
      </div>
    </form>
  );
};

export default KeyModal;

