import { useEffect, useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TextArea } from '../components/ui/TextArea';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { Spinner } from '../components/ui/Spinner';
import { useFamily } from '../contexts/FamilyContext';
import { getChild, updateChild } from '../services/children';
import type { EmergencyContact } from '../types';

export function EditChildPage() {
  const { childId } = useParams<{ childId: string }>();
  const { family } = useFamily();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [allergiesText, setAllergiesText] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [doctorPhone, setDoctorPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { name: '', relationship: '', phone: '' },
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!family || !childId) return;
    getChild(family.id, childId).then((child) => {
      if (child) {
        setName(child.name);
        setDob(child.dateOfBirth);
        setAllergiesText(child.allergies.join(', '));
        setDoctorName(child.doctorName || '');
        setDoctorPhone(child.doctorPhone || '');
        setNotes(child.notes || '');
        setContacts(
          child.emergencyContacts.length > 0
            ? child.emergencyContacts
            : [{ name: '', relationship: '', phone: '' }],
        );
      }
      setLoading(false);
    });
  }, [family, childId]);

  function updateContact(index: number, field: keyof EmergencyContact, value: string) {
    setContacts((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  }

  function addContactRow() {
    setContacts((prev) => [...prev, { name: '', relationship: '', phone: '' }]);
  }

  function removeContact(index: number) {
    setContacts((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!family || !childId) return;
    setError('');
    setSaving(true);

    try {
      const allergies = allergiesText
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const validContacts = contacts.filter((c) => c.name && c.phone);

      await updateChild(family.id, childId, {
        name,
        dateOfBirth: dob,
        allergies,
        emergencyContacts: validContacts,
        doctorName: doctorName || '',
        doctorPhone: doctorPhone || '',
        notes: notes || '',
      });

      navigate(`/children/${childId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to update child.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-warm-700">Edit {name}</h1>

      <Card variant="elevated" padding="lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <Alert variant="error">{error}</Alert>}

          <Input
            label="Child's Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Emma"
            required
          />

          <Input
            label="Date of Birth"
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />

          <Input
            label="Allergies (comma separated)"
            value={allergiesText}
            onChange={(e) => setAllergiesText(e.target.value)}
            placeholder="e.g. Peanuts, Dairy"
          />

          <div className="border-t border-warm-100 pt-6">
            <h2 className="text-xl font-bold text-warm-700 mb-4">
              Emergency Contacts
            </h2>
            {contacts.map((contact, i) => (
              <div key={i} className="mb-4 p-4 bg-cream-50 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-warm-600">Contact {i + 1}</span>
                  {contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(i)}
                      className="text-red-500 hover:text-red-600 text-base font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <Input
                  placeholder="Name"
                  value={contact.name}
                  onChange={(e) => updateContact(i, 'name', e.target.value)}
                />
                <Input
                  placeholder="Relationship (e.g. Mum, Dad)"
                  value={contact.relationship}
                  onChange={(e) => updateContact(i, 'relationship', e.target.value)}
                />
                <Input
                  placeholder="Phone number"
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => updateContact(i, 'phone', e.target.value)}
                />
              </div>
            ))}
            <Button type="button" variant="ghost" onClick={addContactRow}>
              + Add Another Contact
            </Button>
          </div>

          <div className="border-t border-warm-100 pt-6">
            <h2 className="text-xl font-bold text-warm-700 mb-4">Doctor Info</h2>
            <div className="space-y-3">
              <Input
                label="Doctor's Name"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="e.g. Dr. Smith"
              />
              <Input
                label="Doctor's Phone"
                type="tel"
                value={doctorPhone}
                onChange={(e) => setDoctorPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
          </div>

          <TextArea
            label="Additional Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything else the grandparents should know..."
          />

          <div className="flex gap-3">
            <Button type="submit" size="lg" loading={saving}>
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate(`/children/${childId}`)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
