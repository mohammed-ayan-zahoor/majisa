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
                                    <option value="color">Color</option>
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

                        {field.type === 'color' && (
                            <div className="mb-3">
                                <label className="block text-xs text-gray-500 mb-2">Color Options</label>
                                <div className="space-y-2">
                                    {(field.options || []).map((opt, optIndex) => {
                                        const [name, hex] = opt.split('|');
                                        return (
                                            <div key={optIndex} className="flex gap-2 items-center">
                                                <input
                                                    type="color"
                                                    value={hex || '#000000'}
                                                    onChange={(e) => {
                                                        const newOptions = [...(field.options || [])];
                                                        newOptions[optIndex] = `${name || 'Color'}|${e.target.value}`;
                                                        handleFieldChange(index, 'options', newOptions);
                                                    }}
                                                    className="h-8 w-8 rounded cursor-pointer border-0 p-0"
                                                />
                                                <input
                                                    type="text"
                                                    value={name || ''}
                                                    onChange={(e) => {
                                                        const newOptions = [...(field.options || [])];
                                                        newOptions[optIndex] = `${e.target.value}|${hex || '#000000'}`;
                                                        handleFieldChange(index, 'options', newOptions);
                                                    }}
                                                    placeholder="Color Name (e.g. Rose Gold)"
                                                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newOptions = field.options.filter((_, i) => i !== optIndex);
                                                        handleFieldChange(index, 'options', newOptions);
                                                    }}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newOptions = [...(field.options || []), 'New Color|#000000'];
                                            handleFieldChange(index, 'options', newOptions);
                                        }}
                                        className="text-xs text-primary-600 font-medium flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded"
                                    >
                                        <Plus size={12} /> Add Color Option
                                    </button>
                                </div>
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
