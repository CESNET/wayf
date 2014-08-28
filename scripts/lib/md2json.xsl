<?xml version="1.0" encoding="UTF-8"?>
<!-- $Id: md2json.xsl,v 1.2 2012/11/15 01:17:57 sova Exp sova $ -->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                xmlns:mdui="urn:oasis:names:tc:SAML:metadata:ui"
		xmlns:eduidmd="http://eduid.cz/schema/metadata/1.0"
                version="1.0">
  <!-- Feed Label -->
  <xsl:param name="label">Unknown</xsl:param>

  <!-- URI Base for Logos - where are the logos published -->
  <xsl:param  name="logostore">https://disco.eduid.cz/logo/</xsl:param>

  <!-- Missing Logo File Name - would be appended to $logostore -->
  <xsl:param  name="entityMissingLogoLocation">missing.png</xsl:param>

  <!-- Mode of Operation:
       - empty for feed.xml to feed.js conversion
       - 'logos' for extracting IdP logo locations
       - 'sp' for extracting SP information (feed.js to feed-SP.sql conversion)
       -->
  <xsl:param name="mode"/>

  <!-- Logo Parameters -->
  <xsl:param name="logoHeight"/>
  <xsl:param name="logoWidth"/>
  <xsl:param name="logoLang">en</xsl:param>

  <xsl:output mode="text" omit-xml-declaration="yes"/> 

  <xsl:template match="/">
    <xsl:apply-templates />
  </xsl:template>

  <xsl:template match="md:EntitiesDescriptor">
    <xsl:choose>
      <xsl:when test="$mode='logos'">
        <xsl:apply-templates select="md:EntityDescriptor[md:IDPSSODescriptor]"
                             mode="logos"/>
      </xsl:when>
      <xsl:when test="$mode='sp'">
        <xsl:variable name="feedEDName" select="@Name"/>
        <xsl:call-template name="FeedReg"/>

        <xsl:apply-templates select="md:EntityDescriptor[md:SPSSODescriptor]"
                             mode="SPReg">
          <xsl:with-param name="feedEDName" select="$feedEDName"/>
        </xsl:apply-templates>
      </xsl:when>
      <xsl:otherwise>
        <xsl:text>{"id": "</xsl:text><xsl:value-of select="@Name"/><xsl:text>",
  "label": "</xsl:text><xsl:value-of select="$label"/><xsl:text>",
  "entities":
  {</xsl:text>
    <xsl:apply-templates select="md:EntityDescriptor[md:IDPSSODescriptor]"/>
    <xsl:text>}}</xsl:text>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  

  <xsl:template match="md:EntityDescriptor">
    <xsl:if test="md:IDPSSODescriptor">
      <xsl:text>"</xsl:text><xsl:value-of select="@entityID"/><xsl:text>":
   {</xsl:text>
      <!--      <xsl:apply-templates select="md:IDPSSODescriptor">
      </xsl:apply-templates> 
      <xsl:text>,
</xsl:text> -->
      <xsl:call-template name="entityDisplayName">
      </xsl:call-template>
      <xsl:text>,
</xsl:text>
      <xsl:call-template name="entityLogo">
      </xsl:call-template>
      <xsl:call-template name="specialEntityParams"/>
      <xsl:text>}</xsl:text>
      <xsl:if test="position()!=last()">
        <xsl:text>,
</xsl:text>
      </xsl:if>
    </xsl:if>
  </xsl:template>

  <xsl:template name="specialEntityParams">
    <xsl:if test="@eduidmd:authnContextClassRef">
      <xsl:text>
,   "extraArgs": "authnContextClassRef=</xsl:text><xsl:value-of select="@eduidmd:authnContextClassRef"/><xsl:text>"
      </xsl:text>
    </xsl:if>
  </xsl:template>

  <xsl:template match="md:IDPSSODescriptor">
    <xsl:text>"ep": "</xsl:text>
    <xsl:value-of select="md:SingleSignOnService[@Binding='urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST']/@Location"/>
    <xsl:text>"</xsl:text>
  </xsl:template>

  <xsl:template name="entityDisplayName_">
    <xsl:text>"label":
    {</xsl:text>
      <xsl:choose>
        <xsl:when test="descendant::md:Extensions/mdui:UIInfo/mdui:DisplayName">
          <xsl:apply-templates select="descendant::md:Extensions/mdui:UIInfo/mdui:DisplayName">
          </xsl:apply-templates>
        </xsl:when>
        <xsl:when test="descendant::md:Organization/md:OrganizationDisplayName">
          <xsl:apply-templates select="descendant::md:Organization/md:OrganizationDisplayName">
          </xsl:apply-templates>
        </xsl:when>
        <xsl:when test="descendant::md:Organization/md:OrganizationName">
          <xsl:apply-templates select="descendant::md:Organization/md:OrganizationName">
          </xsl:apply-templates>
        </xsl:when>
      </xsl:choose>
      <xsl:text>}</xsl:text>
  </xsl:template>

  <xsl:template name="entityDisplayName">
    <xsl:text>"label":
    {</xsl:text>
      <xsl:choose>
        <xsl:when test="md:IDPSSODescriptor/md:Extensions/mdui:UIInfo/mdui:DisplayName">
          <!--  <xsl:message><xsl:value-of select="@entityID"/> entityDisplayName matched "md:IDPSSODescriptor/md:Extensions/mdui:UIInfo/mdui:DisplayName"
          </xsl:message> -->
          <xsl:apply-templates select="md:IDPSSODescriptor/md:Extensions/mdui:UIInfo/mdui:DisplayName">
          </xsl:apply-templates>
        </xsl:when>
        <xsl:when test="descendant::md:Extensions/mdui:UIInfo/mdui:DisplayName">
          <!--          <xsl:message><xsl:value-of select="@entityID"/> entityDisplayName matched "descendant::md:Extensions/mdui:UIInfo/mdui:DisplayName"
        </xsl:message> -->
          <xsl:apply-templates select="descendant::md:Extensions/mdui:UIInfo/mdui:DisplayName">
          </xsl:apply-templates>
        </xsl:when>
        <xsl:when test="descendant::md:Organization/md:OrganizationDisplayName">
          <!--          <xsl:message><xsl:value-of select="@entityID"/> entityDisplayName matched "descendant::md:Organization/md:OrganizationDisplayName"        </xsl:message> -->
          <xsl:apply-templates select="descendant::md:Organization/md:OrganizationDisplayName">
          </xsl:apply-templates>
        </xsl:when>
        <xsl:when test="descendant::md:Organization/md:OrganizationName">
          <!--          <xsl:message><xsl:value-of select="@entityID"/> entityDisplayName matched "descendant::md:Organization/md:OrganizationName"</xsl:message> -->
          <xsl:apply-templates select="descendant::md:Organization/md:OrganizationName">
          </xsl:apply-templates>
        </xsl:when>
      </xsl:choose>
      <xsl:text>}</xsl:text>
  </xsl:template>

  <xsl:template match="mdui:DisplayName|md:OrganizationDisplayName|md:OrganizationName">
    <xsl:text>"</xsl:text>
      <xsl:value-of select="@xml:lang"/>
      <xsl:text>": "</xsl:text>
      <xsl:value-of select="normalize-space(.)"/>
      <xsl:text>"</xsl:text>
      <xsl:if test="position()!=last()">
        <xsl:text>,
</xsl:text>
      </xsl:if>
  </xsl:template>

  <xsl:template name="entityNames">
    <xsl:param name="zelem"/>
    <!--    <xsl:message>zelem:<xsl:value-of select="$zelem"/> 
    </xsl:message> -->
    <xsl:for-each select="'$zelem'">
      <xsl:text>"</xsl:text>
      <xsl:value-of select="@xml:lang"/>
      <xsl:text>": "</xsl:text>
      <xsl:value-of select="."/>
      <xsl:text>"</xsl:text>
    </xsl:for-each>
  </xsl:template>

  <xsl:template name="entityLogo_">
    <xsl:text>    "logo": "</xsl:text><xsl:value-of select="$logostore"/>
    <xsl:call-template name="logoLocation"/>
    <xsl:text>"</xsl:text>
  </xsl:template>

  <xsl:template name="entityLogo">
    <xsl:text>    "logo": "</xsl:text>
    <xsl:call-template name="addToPath">
      <xsl:with-param name="a" select="$logostore"/>
      <xsl:with-param name="b">
        <xsl:call-template name="logoLocation"/>
      </xsl:with-param>
    </xsl:call-template><!--
<xsl:value-of select="$logostore"/>
    <xsl:call-template name="logoLocation"/> -->
    <xsl:text>"</xsl:text>
  </xsl:template>

  <xsl:template name="logoLocation_">
    <xsl:choose>
      <xsl:when test="md:IDPSSODescriptor/md:Extensions/mdui:UIInfo/mdui:Logo">
        <xsl:call-template name="logoLocalLocation">
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise><xsl:value-of select="$entityMissingLogoLocation"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="logoLocation">
    <xsl:param name="remote">
      <xsl:call-template name="findLogoIdP"/>
    </xsl:param>
    <xsl:choose>
      <xsl:when test="string-length($remote)>0">
        <xsl:call-template name="logoLocalLocation">
          <!-- we decided to use the default extension ('.png')
          <xsl:with-param name="remote" select="$remote"/>
          -->
        </xsl:call-template>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$entityMissingLogoLocation"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="logoLocalLocation">
    <xsl:param name="remote" select="'.png'"/>
    <xsl:variable name="fileType">
      <xsl:call-template name="fileType">
        <xsl:with-param name="f" select="$remote"/>
      </xsl:call-template>
    </xsl:variable>
    <xsl:choose>
      <xsl:when test="substring(@entityID,1,4)='urn:'">
        <!--        <xsl:message>logoLocation: found <xsl:value-of select="@entityID"/>
        </xsl:message> -->
        <xsl:value-of select="@entityID"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:variable name="eid">
          <xsl:value-of select="substring-after(@entityID,'://')"/><xsl:if test="@eduidmd:authnContextClassRef">.<xsl:value-of select="@eduidmd:authnContextClassRef"/></xsl:if>
        </xsl:variable>
        <xsl:value-of select="translate($eid, '/:&amp;=', '....')"/>
        <xsl:text>.</xsl:text>
        <xsl:value-of select="$fileType"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template match="md:EntityDescriptor_" mode="logos">
    <xsl:variable name="logoLoc">
      <xsl:call-template name="logoLocation"/>
    </xsl:variable>

    <xsl:variable name="ll">
      <xsl:call-template name="findLogoIdP"/>
    </xsl:variable>
    <!-- DBG ->
    <xsl:message>ll: <xsl:value-of select="$ll"/>
  </xsl:message> 
  <!- DBG end -->

    <xsl:if test="md:IDPSSODescriptor/md:Extensions/mdui:UIInfo/mdui:Logo">
      <xsl:value-of select="md:IDPSSODescriptor/md:Extensions/mdui:UIInfo/mdui:Logo"/><xsl:text> </xsl:text><xsl:value-of select="concat($logostore,'/',$logoLoc)"/><xsl:text>
</xsl:text>
    </xsl:if>
  </xsl:template>

  <xsl:template match="md:EntityDescriptor" mode="logos">
    <xsl:variable name="logoLoc">
      <xsl:call-template name="logoLocation">
        <!-- we decided to use default fileType (.png) -->
        <xsl:with-param name="remote" select="'.png'"/>
      </xsl:call-template>
    </xsl:variable>

    <xsl:variable name="ll">
      <xsl:call-template name="findLogoIdP"/>
    </xsl:variable>
    <!-- DBG ->
    <xsl:message>ll: <xsl:value-of select="$ll"/>
  </xsl:message> 
  <!- DBG end -->

    <xsl:if test="string-length($ll)>0">
      <xsl:value-of select="$ll"/><xsl:text> </xsl:text><xsl:call-template name="addToPath">
      <xsl:with-param name="a" select="$logostore"/>
      <xsl:with-param name="b" select="$logoLoc"/>
    </xsl:call-template><xsl:text>
</xsl:text>
    </xsl:if>
  </xsl:template>

  <xsl:template name="findLogoIdP">
    <xsl:apply-templates mode="findLogo" select="md:IDPSSODescriptor[md:Extensions/mdui:UIInfo/mdui:Logo]"/>
  </xsl:template>

  <xsl:template name="findLogoSP">
    <xsl:apply-templates mode="findLogo" select="md:SSODescriptor[md:Extensions/mdui:UIInfo/mdui:Logo]">
    </xsl:apply-templates>
  </xsl:template>

  <xsl:template match="md:IDPSSODescriptor|md:SPSSODescriptor" mode="findLogo">
    <xsl:choose>
      <xsl:when test="md:Extensions/mdui:UIInfo/mdui:Logo[@height=40 and @xml:lang='en']">
	<xsl:for-each select="md:Extensions/mdui:UIInfo/mdui:Logo[@height=40 and @xml:lang='en']"> 
	  <xsl:if test="position() = 1">
	    <!--xsl:message>bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb</xsl:message-->
	    <!--xsl:message><xsl:value-of select="."/></xsl:message-->
	    <xsl:apply-templates/>
	  </xsl:if>
	</xsl:for-each>
      </xsl:when>
      <xsl:when test="md:Extensions/mdui:UIInfo/mdui:Logo[@height=40]">
	<xsl:for-each select="md:Extensions/mdui:UIInfo/mdui:Logo[@height=40]"> 
	  <xsl:if test="position() = 1">
	    <!--xsl:message>ccccccccccccccccccccccccccccccccccc</xsl:message-->
	    <!--xsl:message><xsl:value-of select="."/></xsl:message-->
	    <xsl:apply-templates/>
	  </xsl:if>
	</xsl:for-each>
      </xsl:when>
      <xsl:when test="md:Extensions/mdui:UIInfo/mdui:Logo[@xml:lang='en']">
	<xsl:for-each select="md:Extensions/mdui:UIInfo/mdui:Logo[@xml:lang='en']">
	  <xsl:sort select="@height" order="descending" data-type="number"/>
	  <xsl:if test="position() = 1">
	    <!--xsl:message>ddddddddddddddddddddddddddddddddddd</xsl:message-->
	    <!--xsl:message><xsl:value-of select="."/></xsl:message-->
	    <xsl:apply-templates/>
	  </xsl:if>
	</xsl:for-each>
      </xsl:when>
      <xsl:otherwise>
	<xsl:for-each select="md:Extensions/mdui:UIInfo/mdui:Logo">
	  <xsl:sort select="@height" order="descending" data-type="number"/>
	  <xsl:if test="position() = 1">
	    <!--xsl:message>ddddddddddddddddddddddddddddddddddd</xsl:message-->
	    <!--xsl:message><xsl:value-of select="."/></xsl:message-->
	    <xsl:apply-templates/>
	  </xsl:if>
	</xsl:for-each>
      </xsl:otherwise>
    </xsl:choose>

    <!--xsl:message>===================================</xsl:message-->

  </xsl:template>

  <xsl:template match="mdui:Logo" mode="byHeight">
    <xsl:param name="height"/>
    <xsl:if test="@height = $height">
      <xsl:value-of select="."/>
    </xsl:if>
    <!--    <xsl:message>mdui:logo():<xsl:value-of select="."/> 
    </xsl:message> -->
  </xsl:template>

  <!-- SP Registration -->

  <xsl:template match="md:EntityDescriptor" mode="SPReg">
    <xsl:param name="feedEDName"/>
    <xsl:text>insert into spfeed values ('</xsl:text>
    <xsl:call-template name="escapeSQL">
      <xsl:with-param name="in" select="@entityID"/>
    </xsl:call-template>
    <xsl:text>', '</xsl:text>
    <xsl:call-template name="escapeSQL">
      <xsl:with-param name="in" select="$feedEDName"/>
    </xsl:call-template>
    <xsl:text>');
 </xsl:text>
    <!--  -->
    <xsl:call-template name="entityDisplayNameSQL" >
    </xsl:call-template>
  </xsl:template>

  <xsl:template name="FeedReg">
    <xsl:text>insert into feed values ('</xsl:text>
    <xsl:call-template name="escapeSQL">
      <xsl:with-param name="in" select="@Name"/>
    </xsl:call-template>
    <xsl:text>', '</xsl:text>
    <xsl:call-template name="escapeSQL">
      <xsl:with-param name="in" select="$label"/>
    </xsl:call-template>
    <xsl:text>');
</xsl:text>
  </xsl:template>

  <xsl:template name="entityDisplayNameSQL">
      <xsl:choose>
        <xsl:when test="descendant::md:Extensions/mdui:UIInfo/mdui:DisplayName">
          <xsl:apply-templates select="descendant::md:Extensions/mdui:UIInfo/mdui:DisplayName" mode="SQL">
            <xsl:with-param name="eid" select="@entityID"/>
          </xsl:apply-templates>
        </xsl:when>
        <xsl:when test="descendant::md:Organization/md:OrganizationDisplayName">
          <xsl:apply-templates select="descendant::md:Organization/md:OrganizationDisplayName" mode="SQL">
            <xsl:with-param name="eid" select="@entityID"/>
          </xsl:apply-templates>
        </xsl:when>
        <xsl:when test="descendant::md:Organization/md:OrganizationName">
          <xsl:apply-templates select="descendant::md:Organization/md:OrganizationName" mode="SQL">
            <xsl:with-param name="eid" select="@entityID"/>
          </xsl:apply-templates>
        </xsl:when>
      </xsl:choose>
  </xsl:template>

  <xsl:template match="mdui:DisplayName|md:OrganizationDisplayName|md:OrganizationName" mode="SQL">
    <xsl:param name="eid"/>

    <xsl:choose>
      <xsl:when test="ancestor::md:IDPSSODescriptor">
      </xsl:when>
      <xsl:otherwise>
        <xsl:text>insert into displayName values ('</xsl:text>
        <xsl:call-template name="escapeSQL">
          <xsl:with-param name="in" select="$eid"/>
        </xsl:call-template>
        <xsl:text>', '</xsl:text>
        <xsl:call-template name="escapeSQL">
          <xsl:with-param name="in" select="@xml:lang"/>
        </xsl:call-template>
        <xsl:text>', '</xsl:text>
        <xsl:call-template name="escapeSQL">
          <xsl:with-param name="in" select="."/>
        </xsl:call-template>
        <xsl:text>');
</xsl:text>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- utils -->
  <xsl:template name="addToPath">
    <xsl:param name="a"/>
    <xsl:param name="b"/>

    <xsl:variable name="aFixed">
      <xsl:choose>
        <xsl:when test="substring($a,string-length($a),1)='/'">
          <xsl:value-of select="substring($a,1,string-length($a)-1)"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$a"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:variable name="bFixed">
      <xsl:choose>
        <xsl:when test="substring($b,1,1)='/'">
          <xsl:value-of select="substring($b,2)"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$b"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:value-of select="concat($aFixed, '/', $bFixed)"/>
  </xsl:template>

  <xsl:template name="fileType">
    <xsl:param name="f"/>
    <xsl:choose>
      <xsl:when test="string-length(substring-after($f,'.'))=0">
        <xsl:value-of select="$f"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="fileType">
          <xsl:with-param name="f" select="substring-after($f,'.')"/>
        </xsl:call-template>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="escapeSQL">
    <xsl:param name="in"/>
    <xsl:variable name="apos">'</xsl:variable>
    <xsl:if test="$in">
      <xsl:variable name="pref" select="substring-before($in,$apos)"/>
      <xsl:choose>
        <xsl:when test="$pref">
          <xsl:value-of select="concat($pref, $apos, $apos)"/>
          <xsl:call-template name="escapeSQL">
            <xsl:with-param name="in" select="substring-after($in,$apos)"/>
          </xsl:call-template>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="$in"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:if>
  </xsl:template>

  <xsl:template match="text()">
    <xsl:value-of select="normalize-space(.)"/>
  </xsl:template>

  <!--
  <xsl:template name="sqlEscape_">
    <xsl:param name="in"/>
    <xsl:if test="$in">
      <xsl:variable name="first" select="substring($in,1,1)"/>
      <xsl:choose>
        <xsl:when test="$first = '&apos;'">
          <xsl:value-of select="$first"/>
        </xsl:when>
        <xsl:otherwise>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:if>
  </xsl:template>
  -->
</xsl:stylesheet>