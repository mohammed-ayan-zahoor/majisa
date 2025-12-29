import React from 'react';
import { Plus, X } from 'lucide-react';

const CustomFieldManager = ({ fields = [], onChange }) => {
    const handleAddField = () => {
        onChange([...fields, { name: '', type: 'text', options: [], required: false }]);
    };

    const handleRemoveField = (index) => {
        const newFields = fields.filter((_, i) => i !== index);
        onChange(newFields);
    };

    const handleFieldChange = (index, key, value) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], [key]: value };
        onChange(newFields);
    };

    const handleOptionChange = (index, value) => {
        const newFields = [...fields];
        newFields[index] = {
            ...newFields[index],
            options: value.split(',').map(opt => opt.trim())
        };
        onChange(newFields);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700 font-serif">Custom Fields</label>
                <button
                    type="button"
                    onClick={handleAddField}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                    <Plus size={16} /> Add Field
                </button>
            </div>

            <div className="space-y-3">
                {fields.map((field, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
                        <button
                            type="button"
                            onClick={() => handleRemoveField(index)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={16} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Field Name</label>
                                <input
                                    type="text"
                                    required
                                    value={field.name}
                                    onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    placeholder="e.g., Boy Name"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Type</label>
                                <select
                                    value={field.type}
                                    onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                                >
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                    <option value="dropdown">Dropdown</option>
                                </select>
                            </div>
                        </div>

                        {field.type === 'dropdown' && (
                            <div className="mb-3">
                                <label className="block text-xs text-gray-500 mb-1">Options (comma separated)</label>
                                <input
                                    type="text"
                                    value={field.options?.join(', ')}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    placeholder="Option 1, Option 2, Option 3"
                                />
                            </div>
                        )}

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id={`req-${index}`}
                                checked={field.required}
                                onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`req-${index}`} className="ml-2 block text-sm text-gray-600">
                                Required Field
                            </label>
                        </div>
                    </div>
                ))}
                {fields.length === 0 && (
                    <div className="text-center py-6 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-sm">
                        No custom fields configured. These will be asked during order placement.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomFieldManager;
