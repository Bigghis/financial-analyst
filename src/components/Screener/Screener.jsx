import React, { useEffect, useState, useRef, useCallback } from 'react';
import { API_CONFIG } from '../../config/api.config';
import Select from '../UI/Select';
import { createScreenerOptions } from '../../utilities/utils';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Import icons
import FilterInput from '../UI/FilterInput';
import { ScreenerTable } from '../Tables/Screener';
import PropTypes from 'prop-types';


// The queries support operators: GT (greater than), 
// LT (less than), BTWN (between), EQ (equals), and logical operators AND and OR for combining multiple conditions.

const DEFAULT_PAGE_SIZE = 25;

const Screener = () => {
    const renderCount = useRef(0);
    const [options, setOptions] = useState({});
    const [filters, setFilters] = useState({});
    const [screenerResults, setScreenerResults] = useState([]);
    const [params, setParams] = useState({
        pageIndex: 0,
        pageSize: DEFAULT_PAGE_SIZE,
        pageCount: 0,
        sorting: []
    });
    const [isLoading, setIsLoading] = useState(false);


  const [activeTab, setActiveTab] = useState('Equity');
  const tabsContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Check if arrows should be shown
  const checkArrows = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1); // -1 to account for rounding
    }
  };

  // Combine options fetching and arrow checking into one effect
  useEffect(() => {
    const fetchScreenerOptions = async () => {
      try {
        const validMaps = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SCREENER_VALID_MAPS}`);
        const validMapsData = await validMaps.json();

        if (validMapsData && Object.keys(validMapsData).length > 0 && validMapsData.data) {
            const screenerOptions = createScreenerOptions(validMapsData.data);
            setOptions(screenerOptions);
            // Check arrows after options are set
            setTimeout(checkArrows, 0);
        }
      } catch (error) {
        console.error('Error fetching screener options:', error);
      }
    };
    
    fetchScreenerOptions();

    // Set up resize handler
    const handleResize = () => checkArrows();
    window.addEventListener('resize', handleResize);

    // Set up scroll handler
    const tabsContainer = tabsContainerRef.current;
    if (tabsContainer) {
      tabsContainer.addEventListener('scroll', checkArrows);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (tabsContainer) {
        tabsContainer.removeEventListener('scroll', checkArrows);
      }
    };
  }, []); // Combined into a single effect

  // Update runScreener to use params
  const runScreener = async (newParams = params) => {
    setIsLoading(true);
    try {
        const appliedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
            if (value?.value || value?.value1) {
                if (value.value && !value.operator) {
                    acc[key] = { value: value.value };
                } else if (value.operator) {
                    acc[key] = {
                        operator: value.operator,
                        value1: value.value1,
                        value2: value.value2
                    };
                }
            }
            return acc;
        }, {});

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RUN_SCREENER}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                filters: appliedFilters, 
                start: newParams.pageIndex * newParams.pageSize,
                size: newParams.pageSize,
                sort: newParams.sorting
            })
        });
        const runScreenerData = await response.json();
        
        // Calculate total pages based on total items
        const totalPages = Math.ceil(runScreenerData.total / newParams.pageSize);
        
        setScreenerResults(runScreenerData.data || []);
        setParams(prev => ({
            ...prev,
            ...newParams,
            pageCount: totalPages
        }));
    } catch (error) {
        console.error('Error running screener:', error);
        setScreenerResults([]);
    } finally {
        setIsLoading(false);
    }
  };

  // Update handleParamsChange
  const handleParamsChange = useCallback((newParams) => {
    // Run screener with new params
    runScreener(newParams);
  }, [filters]); // Add dependencies as needed

  const handleFilterChange = (key) => (filterData) => {
    setFilters(prev => ({
      ...prev,
      [key]: typeof filterData === 'object' ? 
      (filterData.label ? { value: filterData.value, label: filterData.label } : filterData)
      : { value: filterData },
    }));
  };

  const handleApplyFilters = () => {
    // Reset to first page when applying new filters
    runScreener({
        ...params,
        pageIndex: 0
    });
  };

  const handleClearAll = () => {
    // First, create an empty state object
    const emptyState = {};
    
    // Fill the empty state with initial values for all filters
    Object.keys(options).forEach(tabKey => {
      options[tabKey].filters.forEach(filter => {
        // Use filter.key instead of filter.name
        const filterKey = filter.key; //.toLowerCase();
        if (filter.values) {
          // For Select components
          emptyState[filterKey] = { value: '', label: 'Any' };
        } else {
          // For FilterInput components
          emptyState[filterKey] = {
            operator: '',
            value1: '',
            value2: ''
          };
        }
      });
    });

    // Set the filters state to the empty state
    setFilters(emptyState);
  };

  const renderTabContent = () => {
    const currentTab = Object.keys(options).find(key => options[key].name === activeTab);

    if (!currentTab || !options[currentTab]) {
      return <div className="screener-placeholder">Screener data not available.</div>;
    }


    return (
      <div className="main-row">
        {options[currentTab].filters.map(filter => (
          <div key={filter.name} className="screener-group">
            <label>{filter.name}</label>
            {filter.values ? (
              <Select
                options={filter.values.map(item => 
                  typeof item === 'string' 
                    ? { value: item, label: item }
                    : { value: item.key, label: item.name }
                )}
                value={filters[filter.key]?.label ? filters[filter.key].label : filters[filter.key]?.value}
                onChange={handleFilterChange(filter.key)}
              />
            ) : (
              <FilterInput
                onChange={handleFilterChange(filter.key)}
                value={filters[filter.key]}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Scroll handlers
  const scrollTabs = (direction) => {
    if (tabsContainerRef.current) {
      const scrollAmount = 200; // Adjust this value as needed
      const newScrollLeft = tabsContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      tabsContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    renderCount.current += 1;
  });

  return (
    <div className="screener">
      <div className="tabs-container">
        {showLeftArrow && (
          <button 
            className="tab-scroll-button left"
            onClick={() => scrollTabs('left')}
          >
            <FaChevronLeft />
          </button>
        )}
        
        <div 
          className="screener-tabs"
          ref={tabsContainerRef}
        >
          {options && Object.entries(options).map(([key, tabData]) => (
            <button
              key={key}
              className={`tab-button ${activeTab === tabData.name ? 'active' : ''}`}
              onClick={() => setActiveTab(tabData.name)}
            >
              {tabData.name}
            </button>
          ))}
        </div>

        {showRightArrow && (
          <button 
            className="tab-scroll-button right"
            onClick={() => scrollTabs('right')}
          >
            <FaChevronRight />
          </button>
        )}
      </div>
      {(options && Object.keys(options).length > 0) && (<div className="screener-header">
        <div className="screener-actions">
          <button 
            onClick={handleApplyFilters} 
            className="action-button apply-button"
          >
            Apply Filters
          </button>
          <button 
            onClick={handleClearAll} 
            className="action-button clear-button"
          >
            Clear All
          </button>
        </div>
      </div>)}
      <div className="screener-content">
        {renderTabContent()}
      </div>
      {(screenerResults && screenerResults.length > 0) && (
      <ScreenerTable 
        data={screenerResults} 
        params={params}
        onParamsChange={handleParamsChange}
        isLoading={isLoading}
        pagination={true}
          serverSideSorting={true}
        />
      )}
    </div>
  );
};

Screener.propTypes = {
    data: PropTypes.array,
    columns: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    noDataMessage: PropTypes.string,
    pagination: PropTypes.bool,
    params: PropTypes.shape({
        pageIndex: PropTypes.number,
        pageSize: PropTypes.number,
        pageCount: PropTypes.number,
        sorting: PropTypes.array
    }),
    onParamsChange: PropTypes.func,
};

export default Screener;
