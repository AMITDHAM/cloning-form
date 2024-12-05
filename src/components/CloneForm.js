import React, { useState, useEffect } from 'react';

const CloneDealForm = () => {
  const [oldData, setOldData] = useState({});
  const [newData, setNewData] = useState([]);
  const [cloneCount, setCloneCount] = useState(1);
  const [selectedFields, setSelectedFields] = useState({});

  useEffect(() => {
    const fetchDealDetails = async () => {
      try {
        const response = await fetch(
          'https://deal.hubstools.com/dealDetails?portalId=45964851&dealId=20122189458'
        );
  
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
  
        const deal = await response.json();
  
        // Identify dynamic fields based on array presence
        const dynamicFields = Object.keys(deal).reduce((acc, key) => {
          if (Array.isArray(deal[key]) && deal[key].length > 0) {
            acc[key] = true;
          }
          return acc;
        }, {});
  
        setSelectedFields(dynamicFields);
  
        setOldData({
          oldDealName: deal.dealName,
          oldDealDescription: deal.description,
          pipeline: deal.pipeline,
          dealStage: deal.dealstage,
          contacts: deal.contacts,
          companies: deal.companies,
          dealId: deal.dealId,
        });
  
        // Populate newData with default cloned deals
        setNewData(
          Array.from({ length: cloneCount }, (_, i) => ({
            newDealName: `${deal.dealName} - Clone ${i + 1}`,
            newDealDescription: `${deal.description} - Clone ${i + 1}`,
          }))
        );
      } catch (error) {
        console.error('Failed to fetch deal details:', error);
  
        const defaultDeal = {
          dealId: 20122189458,
          dealName: 'Test Deal',
          dealstage: 'appointmentscheduled',
          pipeline: 'default',
          amount: null,
          hubspot_owner_id: '1858497414',
          description: 'Dummy',
          contacts: [
            {
              associations: null,
              id: '30559324992',
              properties: {
                createdate: '2024-06-16T16:39:42.357Z',
                firstname: 'Tan',
                hs_object_id: '30559324992',
                lastmodifieddate: '2024-12-05T07:40:29.684Z',
                lastname: 'M',
              },
            },
          ],
          companies: [
            {
              associations: null,
              id: '20426546758',
              properties: {
                createdate: '2024-04-24T08:21:25.424Z',
                hs_lastmodifieddate: '2024-12-05T07:40:29.373Z',
                hs_object_id: '20426546758',
                name: 'HubSpot',
              },
            },
          ],
        };
  
        // Identify dynamic fields in default data
        const dynamicFields = Object.keys(defaultDeal).reduce((acc, key) => {
          if (Array.isArray(defaultDeal[key]) && defaultDeal[key].length > 0) {
            acc[key] = true;
          }
          return acc;
        }, {});
  
        setSelectedFields(dynamicFields);
  
        setOldData({
          oldDealName: defaultDeal.dealName,
          oldDealDescription: defaultDeal.description,
          pipeline: defaultDeal.pipeline,
          dealStage: defaultDeal.dealstage,
          contacts: defaultDeal.contacts,
          companies: defaultDeal.companies,
          dealId: defaultDeal.dealId,
        });
  
        setNewData(
          Array.from({ length: cloneCount }, (_, i) => ({
            newDealName: `${defaultDeal.dealName || 'Name'} - Clone ${i + 1}`,
            newDealDescription: `${defaultDeal.description || 'Description'} - Clone ${i + 1}`,
          }))
        );
      }
    };
  
    fetchDealDetails();
  }, [cloneCount]);
  

  const handleCloneCountChange = (e) => {
    const count = parseInt(e.target.value) || 1;
    setCloneCount(count);

    setNewData(
      Array.from({ length: count }, (_, i) => ({
        newDealName: `${oldData.oldDealName || 'Name'} - Clone ${i + 1}`,
        newDealDescription: `${oldData.oldDealDescription || 'Description'} - Clone ${i + 1}`,
      }))
    );
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedNewData = [...newData];
    updatedNewData[index][name] = value;
    setNewData(updatedNewData);
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setSelectedFields({ ...selectedFields, [name]: checked });
  };

  const handleClone = async () => {
    const clones = newData.map((clone) => {
      const clonedDeal = {
        dealId: oldData.dealId,
        dealName: clone.newDealName,
        dealstage: oldData.dealStage,
        pipeline: oldData.pipeline,
      };

      const selectedContacts = oldData.contacts?.filter((contact) =>
        selectedFields[`contact-${contact.id}`]
      );

      if (selectedContacts && selectedContacts.length > 0) {
        clonedDeal.contacts = selectedContacts.map((contact) => ({
          id: contact.id,
          properties: contact.properties,
          associations: contact.associations,
        }));
      }

      const selectedCompanies = oldData.companies?.filter((company) =>
        selectedFields[`company-${company.id}`]
      );

      if (selectedCompanies && selectedCompanies.length > 0) {
        clonedDeal.companies = selectedCompanies.map((company) => ({
          id: company.id,
          properties: company.properties,
          associations: company.associations,
        }));
      }

      return clonedDeal;
    });

    console.log('Cloned Deals:', clones);

    try {
      const response = await fetch(
        'https://deal.hubstools.com/clone-deal?portalId=45964851',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(clones),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to clone: ${response.status}`);
      }

      console.log('Clone successful:', await response.json());
    } catch (error) {
      console.error('Clone failed:', error);
    }
  };

  const handleApplyClone1ToAll = () => {
    if (newData.length > 0) {
      const firstClone = newData[0];
      const updatedData = newData.map(() => ({ ...firstClone }));
      setNewData(updatedData);
    }
  };

  const isEditableField = (field) => Array.isArray(field);

  const formatLabel = (key) => key.replace(/[_-]/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div className="clone-deal-form">
      <h2 className="form-title">Clone & Duplicate Deals</h2>
      <div className="form-group bold-label px-5">
        <h3 className=''>How many times do you want to clone this deal?</h3>
        <label>Number of records to be created</label>
        <input
          type="number"
          value={cloneCount}
          min="1"
          onChange={handleCloneCountChange}
        />
      </div>
      <div className=" px-5">
        <h3>Old Deal Details</h3>
        <div className="">
          <div className="form-group bold-label">
            <label>Old Deal Name</label>
            <input type="text" value={oldData.oldDealName || ''} disabled />
          </div>
          <div className="form-group full-width bold-label">
            <label>Old Deal Description</label>
            <textarea value={oldData.oldDealDescription || ''} disabled />
          </div>
        </div>
        <div className="relative">
          <h3>New Deal Details</h3>
          {newData.map((data, index) => (
            <div key={`newDealName-${index + 1}`} className="form-group bold-label mt-5">
              <label>New Deal Name - Clone {index + 1}</label>
              <input
                type="text"
                name="newDealName"
                value={data.newDealName}
                onChange={(e) => handleChange(index, e)}
              />
              <label>New Deal Description - Clone {index + 1}</label>
              <textarea
                name="newDealDescription"
                value={data.newDealDescription}
                onChange={(e) => handleChange(index, e)}
              />
            </div>
          ))}
          <button onClick={handleApplyClone1ToAll} className="clone-button absolute right-0 top-[35px]">
            Apply Clone 1 Details to All
          </button>
        </div>

        <h3>Properties</h3>
        <div className="form-grid">
          <div className="form-group bold-label">
            <label>Pipeline</label>
            <select
              value={oldData.pipeline || ''}
              disabled={!isEditableField(oldData.pipeline)}
              onChange={(e) => setOldData({ ...oldData, pipeline: e.target.value })}
              className="capitalize"
            >
              {isEditableField(oldData.pipeline) ? (
                oldData.pipeline.map((option) => (
                  <option className="capitalize" key={option} value={option}>
                    {option}
                  </option>
                ))
              ) : (
                <option className="capitalize" value={oldData.pipeline}>
                  {oldData.pipeline}
                </option>
              )}
            </select>
          </div>
          <div className="form-group bold-label">
            <label>Deal Stage</label>
            <select
              value={oldData.dealStage || ''}
              disabled={!isEditableField(oldData.dealStage)}
              onChange={(e) => setOldData({ ...oldData, dealStage: e.target.value })}
              className="capitalize"
            >
              {isEditableField(oldData.dealStage) ? (
                oldData.dealStage.map((option) => (
                  <option key={option} value={option} className="capitalize">
                    {option}
                  </option>
                ))
              ) : (
                <option className="capitalize" value={oldData.dealStage}>
                  {oldData.dealStage}
                </option>
              )}
            </select>
          </div>
        </div>
      </div>
      <h4 className='px-5'>Contacts ({oldData.contacts?.length || 0})</h4>
      <div className="form-grid checkbox-group px-5">
        {oldData.contacts && oldData.contacts.length > 0 ? (
          oldData.contacts.map((contact) => (
            <label key={contact.id} className="border">
              <input
                type="checkbox"
                name={`contact-${contact.id}`}
                checked={selectedFields[`contact-${contact.id}`]}
                onChange={handleCheckboxChange}
              />
              <span>{contact.properties.firstname}</span>
            </label>
          ))
        ) : (
          <p>No contacts available</p>
        )}
        </div>
        <h4 className='px-5'>
          Companies ({oldData.companies?.length || 0})
        </h4>
        <div className="form-grid checkbox-group px-5">
        {oldData.companies && oldData.companies.length > 0 ? (
          oldData.companies.map((company) => (
            <div key={company.id} className="border">
                <label>
                  <input
                    type="checkbox"
                    name={`company-${company.id}`}
                    checked={selectedFields[`company-${company.id}`]}
                    onChange={handleCheckboxChange}
                  />
                  <span>{company.properties.name || '(Unknown Company)'} {company.associations ? `(${company.associations})` : ''}</span>
                </label>
            </div>
          ))
        ) : (
          <p>No companies available</p>
        )}
      </div>
      <div className='ml-5'>
        <button onClick={handleClone} className="clone-button">
          Clone Deal
        </button>
      </div>
    </div>
  );
};

export default CloneDealForm;
