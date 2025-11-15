import React, { useState } from 'react';
import { Configuration } from '../types';
import { Button } from './ui/button';
import { Label } from './ui/label';

interface ConfigurationModalProps {
  config?: Configuration;
  onSubmit: (key: string, value: string) => void;
  onCancel: () => void;
}

const ConfigurationModal: React.FC<ConfigurationModalProps> = ({
  config,
  onSubmit,
  onCancel,
}) => {
  const [key, setKey] = useState(config?.key || '');
  const [value, setValue] = useState(config?.value || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim() && value.trim()) {
      onSubmit(key, value);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="configKey" className="block text-sm font-medium text-foreground mb-2">
          Key
        </Label>
        <input
          type="text"
          id="configKey"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-foreground"
          required
          autoFocus
          placeholder="e.g., Website URL, Email, Password"
        />
      </div>
      <div>
        <Label htmlFor="configValue" className="block text-sm font-medium text-foreground mb-2">
          Value
        </Label>
        <textarea
          id="configValue"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 bg-card border border-border rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-foreground resize-none"
          required
          placeholder="Enter the value..."
        />
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
          disabled={!key.trim() || !value.trim()}
        >
          {config ? 'Save Changes' : 'Add Configuration'}
        </Button>
      </div>
    </form>
  );
};

export default ConfigurationModal;

