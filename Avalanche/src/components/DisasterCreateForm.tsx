import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { X, MapPin, AlertTriangle } from 'lucide-react';
import type { DisasterCreateInput } from '@/types/disaster';

interface DisasterCreateFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (disaster: DisasterCreateInput) => void;
  loading?: boolean;
}

const DISASTER_TYPES = [
  { value: 'flood', label: 'Flood', emoji: '🌊' },
  { value: 'earthquake', label: 'Earthquake', emoji: '🌍' },
  { value: 'wildfire', label: 'Wildfire', emoji: '🔥' },
  { value: 'storm', label: 'Storm', emoji: '⛈️' },
  { value: 'tornado', label: 'Tornado', emoji: '🌪️' },
  { value: 'tsunami', label: 'Tsunami', emoji: '🌊' },
  { value: 'avalanche', label: 'Avalanche', emoji: '🏔️' },
  { value: 'landslide', label: 'Landslide', emoji: '🏔️' },
  { value: 'drought', label: 'Drought', emoji: '☀️' },
  { value: 'heatwave', label: 'Heatwave', emoji: '🌡️' },
  { value: 'blizzard', label: 'Blizzard', emoji: '❄️' },
  { value: 'hailstorm', label: 'Hailstorm', emoji: '🧊' },
  { value: 'volcanic_eruption', label: 'Volcanic Eruption', emoji: '🌋' },
  { value: 'pandemic', label: 'Pandemic', emoji: '🦠' },
  { value: 'chemical_spill', label: 'Chemical Spill', emoji: '☢️' },
  { value: 'nuclear_accident', label: 'Nuclear Accident', emoji: '☢️' },
  { value: 'terrorist_attack', label: 'Terrorist Attack', emoji: '💥' },
  { value: 'cyber_attack', label: 'Cyber Attack', emoji: '💻' },
  { value: 'power_outage', label: 'Power Outage', emoji: '⚡' },
  { value: 'gas_leak', label: 'Gas Leak', emoji: '⛽' },
  { value: 'building_collapse', label: 'Building Collapse', emoji: '🏢' },
  { value: 'bridge_collapse', label: 'Bridge Collapse', emoji: '🌉' },
  { value: 'other', label: 'Other', emoji: '⚠️' }
];

const CATEGORIES = [
  { value: 'natural', label: 'Natural Disaster' },
  { value: 'man_made', label: 'Man-Made Disaster' },
  { value: 'technological', label: 'Technological Disaster' },
  { value: 'biological', label: 'Biological Disaster' },
  { value: 'other', label: 'Other' }
];

export default function DisasterCreateForm({ isOpen, onClose, onSubmit, loading = false }: DisasterCreateFormProps) {
  const [formData, setFormData] = useState<DisasterCreateInput>({
    disasterType: '',
    severityLevel: 5,
    location: { lat: 0, lng: 0 },
    reporter: '',
    reporterEmail: '',
    reporterName: '',
    message: '',
    range: 50,
    category: 'natural',
    tags: [],
    affectedArea: 0,
    estimatedCasualties: 0,
    estimatedDamage: 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof DisasterCreateInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleLocationChange = (field: 'lat' | 'lng', value: number) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.disasterType) {
      newErrors.disasterType = 'Disaster type is required';
    }

    if (formData.severityLevel < 1 || formData.severityLevel > 10) {
      newErrors.severityLevel = 'Severity level must be between 1 and 10';
    }

    if (formData.location.lat === 0 && formData.location.lng === 0) {
      newErrors.location = 'Location coordinates are required';
    }

    if (!formData.reporter) {
      newErrors.reporter = 'Reporter ID is required';
    }

    if (!formData.reporterEmail) {
      newErrors.reporterEmail = 'Reporter email is required';
    }

    if (!formData.message || formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getSeverityLabel = (level: number) => {
    if (level >= 8) return 'CRITICAL';
    if (level >= 6) return 'HIGH';
    if (level >= 4) return 'MEDIUM';
    return 'LOW';
  };

  const getSeverityColor = (level: number) => {
    if (level >= 8) return 'text-red-600';
    if (level >= 6) return 'text-orange-600';
    if (level >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Report New Disaster
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Disaster Type */}
              <div className="space-y-2">
                <Label htmlFor="disasterType">Disaster Type *</Label>
                <Select
                  value={formData.disasterType}
                  onValueChange={(value) => handleInputChange('disasterType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select disaster type" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISASTER_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <span>{type.emoji}</span>
                          <span>{type.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.disasterType && (
                  <p className="text-sm text-red-600">{errors.disasterType}</p>
                )}
              </div>

              {/* Severity Level */}
              <div className="space-y-2">
                <Label>Severity Level *</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Low (1)</span>
                    <span className={`font-semibold ${getSeverityColor(formData.severityLevel)}`}>
                      {getSeverityLabel(formData.severityLevel)} ({formData.severityLevel})
                    </span>
                    <span className="text-sm text-muted-foreground">Critical (10)</span>
                  </div>
                  <Slider
                    value={[formData.severityLevel]}
                    onValueChange={([value]) => handleInputChange('severityLevel', value)}
                    min={1}
                    max={10}
                    step={1}
                    className="w-full"
                  />
                </div>
                {errors.severityLevel && (
                  <p className="text-sm text-red-600">{errors.severityLevel}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Location Coordinates *</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="e.g., 22.5726"
                      value={formData.location.lat || ''}
                      onChange={(e) => handleLocationChange('lat', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="e.g., 88.3639"
                      value={formData.location.lng || ''}
                      onChange={(e) => handleLocationChange('lng', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                {errors.location && (
                  <p className="text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              {/* Reporter Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reporterName">Reporter Name</Label>
                  <Input
                    id="reporterName"
                    placeholder="Your name"
                    value={formData.reporterName || ''}
                    onChange={(e) => handleInputChange('reporterName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reporterEmail">Reporter Email *</Label>
                  <Input
                    id="reporterEmail"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.reporterEmail}
                    onChange={(e) => handleInputChange('reporterEmail', e.target.value)}
                  />
                  {errors.reporterEmail && (
                    <p className="text-sm text-red-600">{errors.reporterEmail}</p>
                  )}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleInputChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Description *</Label>
                <Textarea
                  id="message"
                  placeholder="Describe the disaster in detail..."
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={4}
                />
                {errors.message && (
                  <p className="text-sm text-red-600">{errors.message}</p>
                )}
              </div>

              {/* Range */}
              <div className="space-y-2">
                <Label htmlFor="range">Affected Range (km)</Label>
                <Input
                  id="range"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.range}
                  onChange={(e) => handleInputChange('range', parseInt(e.target.value) || 50)}
                />
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="affectedArea">Affected Area (km²)</Label>
                  <Input
                    id="affectedArea"
                    type="number"
                    min="0"
                    value={formData.affectedArea || ''}
                    onChange={(e) => handleInputChange('affectedArea', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedCasualties">Estimated Casualties</Label>
                  <Input
                    id="estimatedCasualties"
                    type="number"
                    min="0"
                    value={formData.estimatedCasualties || ''}
                    onChange={(e) => handleInputChange('estimatedCasualties', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedDamage">Estimated Damage ($)</Label>
                  <Input
                    id="estimatedDamage"
                    type="number"
                    min="0"
                    value={formData.estimatedDamage || ''}
                    onChange={(e) => handleInputChange('estimatedDamage', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Disaster Alert'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
