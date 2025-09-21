/**
 * URL Validation Service with Google Safe Browsing API integration
 * Validates URLs for security, HTTPS compliance, and malware checking
 */

// Interface for validation results
export interface URLValidationResult {
  isValid: boolean;
  isSecure: boolean; // HTTPS check
  isSafe: boolean; // Safe Browsing check
  errors: string[];
  warnings: string[];
  normalizedUrl?: string;
}

// Interface for Google Safe Browsing API response
interface SafeBrowsingResponse {
  matches?: Array<{
    threatType: string;
    platformType: string;
    threatEntryType: string;
    threat: {
      url: string;
    };
  }>;
}

class URLValidationService {
  private readonly apiKey: string;
  private readonly safeBrowsingEndpoint = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';

  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️ Google API key not found. Safe Browsing checks will be skipped.');
    }
  }

  /**
   * Comprehensive URL validation
   */
  async validateURL(url: string): Promise<URLValidationResult> {
    const result: URLValidationResult = {
      isValid: false,
      isSecure: false,
      isSafe: false,
      errors: [],
      warnings: []
    };

    try {
      // Step 1: Basic URL format validation
      const urlValidation = this.validateURLFormat(url);
      if (!urlValidation.isValid) {
        result.errors.push(...urlValidation.errors);
        return result;
      }

      result.normalizedUrl = urlValidation.normalizedUrl;
      result.isValid = true;

      // Step 2: HTTPS validation
      const httpsValidation = this.validateHTTPS(result.normalizedUrl!);
      result.isSecure = httpsValidation.isSecure;
      if (!httpsValidation.isSecure) {
        result.warnings.push(...httpsValidation.warnings);
      }

      // Step 3: Safe Browsing API check (if API key available)
      if (this.apiKey) {
        const safeBrowsingResult = await this.checkSafeBrowsing(result.normalizedUrl!);
        result.isSafe = safeBrowsingResult.isSafe;
        if (!safeBrowsingResult.isSafe) {
          result.errors.push(...safeBrowsingResult.errors);
        }
      } else {
        // Skip Safe Browsing check if no API key
        result.isSafe = true;
        result.warnings.push('Safe Browsing check skipped - API key not available');
      }

      // Step 4: Check if URL is accessible (basic connectivity test)
      const accessibilityResult = await this.checkURLAccessibility(result.normalizedUrl!);
      if (!accessibilityResult.isAccessible) {
        result.warnings.push(...accessibilityResult.warnings);
      }

    } catch (error) {
      console.error('URL validation error:', error);
      result.errors.push('An error occurred during URL validation');
    }

    return result;
  }

  /**
   * Validate URL format and normalize it
   */
  private validateURLFormat(url: string): { isValid: boolean; normalizedUrl?: string; errors: string[] } {
    const errors: string[] = [];

    if (!url || typeof url !== 'string' || url.trim() === '') {
      errors.push('URL is required');
      return { isValid: false, errors };
    }

    const trimmedUrl = url.trim();

    try {
      // Add protocol if missing
      let normalizedUrl = trimmedUrl;
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      // Validate URL using URL constructor
      const urlObj = new URL(normalizedUrl);

      // Check for valid hostname
      if (!urlObj.hostname || urlObj.hostname.includes('..') || urlObj.hostname.length < 1) {
        errors.push('Invalid hostname');
        return { isValid: false, errors };
      }

      // Check for suspicious patterns
      if (this.containsSuspiciousPatterns(normalizedUrl)) {
        errors.push('URL contains suspicious patterns');
        return { isValid: false, errors };
      }

      return { 
        isValid: true, 
        normalizedUrl: normalizedUrl,
        errors: [] 
      };

    } catch (error) {
      errors.push('Invalid URL format');
      return { isValid: false, errors };
    }
  }

  /**
   * Validate HTTPS usage
   */
  private validateHTTPS(url: string): { isSecure: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    try {
      const urlObj = new URL(url);
      const isSecure = urlObj.protocol === 'https:';
      
      if (!isSecure) {
        warnings.push('Website does not use HTTPS - this may pose security risks');
      }

      return { isSecure, warnings };
    } catch (error) {
      return { isSecure: false, warnings: ['Could not determine if URL uses HTTPS'] };
    }
  }

  /**
   * Check URL against Google Safe Browsing API
   */
  private async checkSafeBrowsing(url: string): Promise<{ isSafe: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const requestBody = {
        client: {
          clientId: 'aiarcade-tool-submission',
          clientVersion: '1.0.0'
        },
        threatInfo: {
          threatTypes: [
            'MALWARE',
            'SOCIAL_ENGINEERING', 
            'UNWANTED_SOFTWARE',
            'POTENTIALLY_HARMFUL_APPLICATION'
          ],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }]
        }
      };

      const response = await fetch(`${this.safeBrowsingEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        console.error('Safe Browsing API error:', response.status, response.statusText);
        errors.push('Unable to verify URL safety - please try again later');
        return { isSafe: false, errors };
      }

      const data: SafeBrowsingResponse = await response.json();

      if (data.matches && data.matches.length > 0) {
        const threatTypes = data.matches.map(match => match.threatType).join(', ');
        errors.push(`URL flagged as unsafe: ${threatTypes}`);
        return { isSafe: false, errors };
      }

      return { isSafe: true, errors: [] };

    } catch (error) {
      console.error('Safe Browsing check error:', error);
      errors.push('Unable to verify URL safety');
      return { isSafe: false, errors };
    }
  }

  /**
   * Basic accessibility check for the URL
   */
  private async checkURLAccessibility(url: string): Promise<{ isAccessible: boolean; warnings: string[] }> {
    const warnings: string[] = [];

    try {
      // For client-side validation, we can't make direct fetch requests due to CORS
      // This would need to be implemented as a server-side API endpoint
      // For now, we'll just perform basic checks
      
      const urlObj = new URL(url);
      
      // Check for localhost or private IPs (basic check)
      if (urlObj.hostname === 'localhost' || 
          urlObj.hostname.startsWith('127.') ||
          urlObj.hostname.startsWith('192.168.') ||
          urlObj.hostname.startsWith('10.') ||
          urlObj.hostname.includes('localhost')) {
        warnings.push('URL appears to be a local/private address');
      }

      return { isAccessible: true, warnings };

    } catch (error) {
      warnings.push('Could not verify URL accessibility');
      return { isAccessible: false, warnings };
    }
  }

  /**
   * Check for suspicious patterns in URLs
   */
  private containsSuspiciousPatterns(url: string): boolean {
    const suspiciousPatterns = [
      /[<>'"]/g, // HTML/script injection
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /file:/i,
      /\.exe$|\.bat$|\.cmd$|\.scr$/i, // Executable file extensions
      /[^\x20-\x7E]/g, // Non-printable ASCII characters (basic check)
    ];

    return suspiciousPatterns.some(pattern => pattern.test(url));
  }

  /**
   * Quick validation for real-time feedback (without API calls)
   */
  validateURLQuick(url: string): { isValid: boolean; isSecure: boolean; errors: string[] } {
    const formatValidation = this.validateURLFormat(url);
    if (!formatValidation.isValid) {
      return { isValid: false, isSecure: false, errors: formatValidation.errors };
    }

    const httpsValidation = this.validateHTTPS(formatValidation.normalizedUrl!);
    
    return {
      isValid: true,
      isSecure: httpsValidation.isSecure,
      errors: []
    };
  }
}

// Create and export service instance
export const urlValidationService = new URLValidationService();

// Export validation function for easy use
export const validateURL = (url: string) => urlValidationService.validateURL(url);
export const validateURLQuick = (url: string) => urlValidationService.validateURLQuick(url);