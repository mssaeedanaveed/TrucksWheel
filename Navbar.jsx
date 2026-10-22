import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '../context/FormContext';

/**
 * Responsive, accessible navigation bar for TruckWheel
 * - Fixed at top with shadow
 * - Left: circular logo + brand
 * - Right: nav links, search, profile avatar
 * - Mobile: hamburger toggles a vertical dropdown
 */

const NAV_HEIGHT_PX = 70;

const NavBarWrapper = styled.nav`
  position: fixed;
  top: ${props => props.$isFormOpen ? '-100%' : '0'};
  left: 0;
  transition: top 0.3s ease-in-out;
  right: 0;
  height: ${NAV_HEIGHT_PX}px;

  /* Reduce transparency: add semi-opaque backdrop color */
  background: rgba(15, 23, 42, 0.8);

  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.15);
  z-index: 1000; /* Lower than modal overlay's z-index of 2000 */
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

`;

const AddListingContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const AddListingButton = styled(Link)`
  text-decoration: none;
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 600;
  color: #ffffff;
  background: #000000;
  border: 1px solid #000000;
  transition: all 160ms ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;

  &:hover {
    background: #111111;
  }

  &:focus-visible {
    outline: 3px solid #d1d5db;
    outline-offset: 2px;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 100;
  overflow: hidden;
  opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transform: translateY(${({ $isOpen }) => ($isOpen ? '0' : '-10px')});
  transition: all 0.2s ease;
`;

const DropdownItem = styled(Link)`
  display: block;
  padding: 12px 16px;
  color: #1f2937;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background 150ms ease;
  text-align: left;
  white-space: nowrap;

  &:hover {
    background: #f3f4f6;
  }

  &:active {
    background: #e5e7eb;
  }
`;

const AddIcon = styled.span`
  color: #ef4444; /* red */
  font-weight: 700;
  margin-right: 8px;
  font-size: 22px;
  line-height: 1;
  display: inline-block;
`;

const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Logo = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.2);
`;

const Brand = styled.span`
  font-weight: 800;
  font-size: 1.25rem;
  letter-spacing: 0.2px;
  color: #ffffff;
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 900px) {
    display: none;
  }
`;

const NavLinks = styled.ul`
  display: flex;
  align-items: center;
  gap: 16px;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavLink = styled(Link)`
  position: relative;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  padding: 8px 6px;
  border-radius: 6px;
  transition: color 160ms ease;

  &:hover {
    color: #ffffff;
  }

  &:focus-visible {
    outline: 3px solid #93c5fd;
    outline-offset: 2px;
  }

  &::after {
    content: '';
    position: absolute;
    left: 8px;
    right: 8px;
    bottom: 4px;
    height: 2px;
    background: transparent;
    transition: background 160ms ease;
  }

  &:hover::after {
    background: #ffffff;
  }
`;

const SearchForm = styled.form`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 260px;
  max-width: 40vw;
  padding: 10px 12px;
  padding-left: 36px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  color: #ffffff;

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    outline: none;
    border-color: #93c5fd;
    box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.45);
  }
`;

const SearchIcon = styled.span`
  position: absolute;
  left: 10px;
  color: rgba(255, 255, 255, 0.6);
  pointer-events: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const ProfileLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;

  &:focus-visible {
    outline: 3px solid #93c5fd;
    outline-offset: 4px;
    border-radius: 9999px;
  }
`;

const ProfileImg = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  object-fit: cover;
  object-position: center;
  transition: transform 140ms ease, box-shadow 140ms ease;

  &:hover {
    transform: scale(1.04);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
  }
`;

const HamburgerButton = styled.button`
  display: none;

  @media (max-width: 900px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  background: transparent;
  border: none;
  color: #ffffff;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:focus-visible {
    outline: 3px solid #93c5fd;
    outline-offset: 2px;
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  top: ${NAV_HEIGHT_PX}px;
  left: 0;
  right: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 999;
  display: ${({ open }) => (open ? 'block' : 'none')};

  @media (min-width: 901px) {
    display: none;
  }
`;

const MobileMenuInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 16px 16px;
  display: grid;
  gap: 10px;
`;

const MobileSearchForm = styled(SearchForm)`
  order: -1;
`;

const MobileSearchInput = styled(SearchInput)`
  width: 100%;
  max-width: 100%;
`;

const MobileLinks = styled.ul`
  list-style: none;
  margin: 0;
  padding: 6px 0 0 0;
  display: grid;
  gap: 6px;
`;

// Create a base link component that can be rendered as different elements
const MobileLink = styled(Link).withConfig({
  shouldForwardProp: (prop) => prop !== 'as',
})`
  display: block;
  padding: 12px 10px;
  border-radius: 10px;
  text-decoration: none;
  color: #ffffff;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
  font-size: 16px;
  font-family: inherit;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
  
  &:focus-visible {
    outline: 3px solid #93c5fd;
    outline-offset: 2px;
  }
  
  /* Style when rendered as a button */
  ${(props) => props.as === 'button' && `
    background: none;
    border: none;
    text-align: left;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  `}
`;

export default function Navbar() {
  const { isFormOpen } = useForm();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Function to handle user logout
  const handleLogout = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Clear all stored data
    localStorage.removeItem('user');
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(';').forEach(c => {
      document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
    });
    
    // Force a full page reload to clear all state
    window.location.href = '/?logout=true';
    
    return false;
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileOpen && !event.target.closest('[data-profile-dropdown]')) {
        setProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  // Check authentication status on component mount and set up storage event listener
  useEffect(() => {
    const updateUserFromStorage = () => {
      const storedUser = localStorage.getItem('user');
      console.log('Updating user from storage:', storedUser);
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user');
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    // Initial check
    updateUserFromStorage();

    // Listen for storage events (from other tabs or logout)
    window.addEventListener('storage', updateUserFromStorage);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', updateUserFromStorage);
    };
  }, []);

  // Storage event listener is now handled in the main effect above

  // Style for dropdown links
  const dropdownLinkStyle = {
    display: 'block',
    padding: '10px 16px',
    color: '#111827',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'background-color 0.2s',
    textAlign: 'left',
    width: '100%',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#f9fafb'
    }
  };
  // Close menu when resizing to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 900) {
        if (isOpen) setIsOpen(false);
      } else {
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('q')?.toString().trim();
    if (query) {
      const enc = encodeURIComponent(query);
      navigate(`/search?q=${enc}`);
    }
    setIsOpen(false);
  };

  // Avatar source based on user state
  const avatarSrc = user?.photoUrl || 'https://placehold.co/72x72/png?text=PW';

  return (
    <>
      <NavBarWrapper $isFormOpen={isFormOpen} aria-label="Primary">
        <Inner>
          <LeftGroup>
            <Link to="/" aria-label="Go to TruckWheel home">
              <Logo
                src="images/logo.png"
                alt="TruckWheel logo"
              />
            </Link>
            <Brand>TrucksWheel</Brand>
          </LeftGroup>

          <RightGroup>
            <NavLinks aria-label="Primary navigation">
              <li><NavLink to="/">Home</NavLink></li>
              <li><NavLink to="/listing">Listing</NavLink></li>
              <li><NavLink to="/seller">Seller</NavLink></li>
              <li><NavLink to="/news">News</NavLink></li>
              <li><NavLink to="/about">About Us</NavLink></li>
            </NavLinks>

            <SearchForm role="search" aria-label="Site search" onSubmit={handleSearchSubmit}>
              <SearchIcon aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M21 21l-4.2-4.2M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </SearchIcon>
              <SearchInput
                name="q"
                type="search"
                placeholder="Search…"
                aria-label="Search site"
              />
            </SearchForm>
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => {
                  if (user) {
                    setProfileOpen(!profileOpen);
                  } else {
                    navigate('/auth');
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  position: 'relative'
                }}
                aria-label={user ? 'View profile' : 'Sign in'}
                aria-expanded={user ? profileOpen : false}
              >
                <ProfileImg
                  src={user ? avatarSrc : 'https://placehold.co/72x72/png?text=Sign+In'}
                  alt={user ? 'Profile' : 'Sign In'}
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.onerror = null;
                    target.src = 'https://placehold.co/72x72/png?text=PW';
                  }}
                />
              </button>
              <div 
                data-profile-dropdown
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  minWidth: '240px',
                  zIndex: 1002,
                  overflow: 'hidden',
                  border: '1px solid #e5e7eb',
                  opacity: profileOpen ? 1 : 0,
                  visibility: profileOpen ? 'visible' : 'hidden',
                  transform: profileOpen ? 'translateY(0)' : 'translateY(-10px)',
                  transition: 'all 0.2s ease-in-out',
                  pointerEvents: profileOpen ? 'auto' : 'none'
                }}>
                  {user ? (
                    <>
                      <div style={{ 
                        padding: '20px', 
                        borderBottom: '1px solid #f3f4f6',
                        background: '#f9fafb'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '14px',
                          marginBottom: '4px'
                        }}>
                          <img 
                            src={avatarSrc} 
                            alt={user.name || 'User'} 
                            style={{
                              width: '52px',
                              height: '52px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '3px solid white',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                          />
                          <div>
                            <div style={{ 
                              fontWeight: '600', 
                              color: '#111827',
                              fontSize: '15px',
                              lineHeight: '1.4'
                            }}>
                              {user.name || 'User'}
                            </div>
                            <div style={{ 
                              fontSize: '13px', 
                              color: '#6b7280',
                              wordBreak: 'break-word'
                            }}>
                              {user.email || ''}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ padding: '12px 8px' }}>
                        <div style={{ 
                          marginTop: '4px',
                          padding: '4px 0'
                        }}>
                          <Link 
                            to="/"
                            onClick={handleLogout}
                            style={{
                              ...dropdownLinkStyle,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              color: '#ef4444',
                              textAlign: 'left',
                              textDecoration: 'none',
                              transition: 'all 0.15s ease',
                              ':hover': {
                                backgroundColor: '#fef2f2',
                                transform: 'translateX(2px)'
                              },
                              ':active': {
                                backgroundColor: '#fee2e2'
                              }
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                              <polyline points="16 17 21 12 16 7"></polyline>
                              <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Sign Out
                          </Link>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ 
                      padding: '20px',
                      textAlign: 'center'
                    }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 16px',
                        borderRadius: '50%',
                        backgroundColor: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px'
                      }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <p style={{ 
                        marginBottom: '16px', 
                        color: '#4b5563',
                        fontSize: '15px',
                        lineHeight: '1.5'
                      }}>
                        Sign in to access your account and manage your profile
                      </p>
                      <a 
                        href="/auth" 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '10px 16px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontWeight: '500',
                          transition: 'all 0.2s ease',
                          ':hover': {
                            backgroundColor: '#2563eb',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
                          },
                          ':active': {
                            transform: 'translateY(0)'
                          }
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                          <polyline points="10 17 15 12 10 7"></polyline>
                          <line x1="15" y1="12" x2="3" y2="12"></line>
                        </svg>
                        Sign In
                      </a>
                    </div>
                  )}
                </div>
            </div>
            
            {/* Click outside handler */}
            {profileOpen && (
              <div 
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1001,
                  pointerEvents: 'auto'
                }}
                onClick={(e) => {
                  // Only close if clicking directly on the overlay, not on the dropdown
                  if (e.target === e.currentTarget) {
                    setProfileOpen(false);
                  }
                }}
              />
            )}
            <AddListingContainer>
              <AddListingButton 
                as="button"
                aria-label="Add listing options" 
                aria-expanded={isDropdownOpen}
                onClick={(e) => {
                  e.preventDefault();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <AddIcon aria-hidden>+</AddIcon>
                <span>Add Listing</span>
                {!user && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: '4px' }}>
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </AddListingButton>
              <DropdownMenu 
                $isOpen={isDropdownOpen}
                onMouseEnter={() => setIsDropdownOpen(true)}
                onMouseLeave={() => setIsDropdownOpen(false)}
              >
                <DropdownItem 
                  as="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsDropdownOpen(false);
                    if (user) {
                      navigate('/add-listing');
                    } else {
                      navigate('/auth', { 
                        state: { 
                          from: '/add-listing',
                          message: 'Please sign in to list your light vehicle',
                          listingType: 'light'
                        } 
                      });
                    }
                  }}
                >
                  List Light Vehicles
                </DropdownItem>
                <DropdownItem 
                  as="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsDropdownOpen(false);
                    if (user) {
                      navigate('/heavy-vehicles');
                    } else {
                      navigate('/auth', { 
                        state: { 
                          from: '/heavy-vehicles',
                          message: 'Please sign in to list your heavy vehicle',
                          listingType: 'heavy'
                        } 
                      });
                    }
                  }}
                >
                  List Heavy Vehicles
                </DropdownItem>
              </DropdownMenu>
            </AddListingContainer>
          </RightGroup>

          <HamburgerButton
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-controls="mobile-menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((v) => !v)}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </HamburgerButton>
        </Inner>
      </NavBarWrapper>

      {/* Mobile dropdown */}
      <MobileMenu id="mobile-menu" role="region" aria-label="Mobile menu" open={isOpen}>
        <MobileMenuInner>
          <MobileSearchForm role="search" aria-label="Site search (mobile)" onSubmit={handleSearchSubmit}>
            <SearchIcon aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 21l-4.2-4.2M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </SearchIcon>
            <MobileSearchInput
              name="q"
              type="search"
              placeholder="Search…"
              aria-label="Search site"
            />
          </MobileSearchForm>

          <MobileLinks aria-label="Primary navigation (mobile)">
            <li><MobileLink to="/" onClick={() => setIsOpen(false)}>Home</MobileLink></li>
            <li><MobileLink to="/about" onClick={() => setIsOpen(false)}>About Us</MobileLink></li>
            <li><MobileLink to="/listing" onClick={() => setIsOpen(false)}>Listing</MobileLink></li>
            <li><MobileLink to="/seller" onClick={() => setIsOpen(false)}>Seller</MobileLink></li>
            <li><MobileLink to="/news" onClick={() => setIsOpen(false)}>News</MobileLink></li>
            
            {/* Add Listing in Mobile */}
            <li>
              <MobileLink 
                as="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  if (user) {
                    navigate('/add-listing');
                  } else {
                    navigate('/auth', { 
                      state: { 
                        from: '/add-listing',
                        message: 'Please sign in to list your vehicle',
                        listingType: 'light'
                      } 
                    });
                  }
                }}
              >
                List Light Vehicles
              </MobileLink>
            </li>
            <li>
              <MobileLink 
                as="button"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  if (user) {
                    navigate('/heavy-vehicles');
                  } else {
                    navigate('/auth', { 
                      state: { 
                        from: '/heavy-vehicles',
                        message: 'Please sign in to list your heavy vehicle',
                        listingType: 'heavy'
                      } 
                    });
                  }
                }}
              >
                List Heavy Vehicles
              </MobileLink>
            </li>
            
            <li>
              <MobileLink 
                to={user ? "/profile" : "/auth?redirect=/profile"}
                onClick={() => {
                  setIsOpen(false);
                  if (!user) {
                    navigate('/auth');
                  }
                }}
              >
                Profile
              </MobileLink>
            </li>
            <li>
              <MobileLink 
                to={user ? "/add-listing" : "/auth?redirect=/add-listing"}
                onClick={() => {
                  setIsOpen(false);
                  if (!user) {
                    navigate('/auth');
                  }
                }}
              >
                <AddIcon aria-hidden>+</AddIcon>
                List Light Vehicle
              </MobileLink>
            </li>
            <li>
              <MobileLink 
                to={user ? "/heavy-vehicles" : "/auth?redirect=/heavy-vehicles"}
                onClick={() => {
                  setIsOpen(false);
                  if (!user) {
                    navigate('/auth');
                  }
                }}
              >
                <AddIcon aria-hidden>+</AddIcon>
                List Heavy Vehicle
              </MobileLink>
            </li>
          </MobileLinks>
        </MobileMenuInner>
      </MobileMenu>
    </>
  );
}

// Optional helper to offset page content if needed
export const NavSpacer = styled.div`
  height: ${NAV_HEIGHT_PX}px;
`;


